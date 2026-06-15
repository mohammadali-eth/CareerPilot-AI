from abc import ABC, abstractmethod
import json
import time
from typing import Any, Dict, List, Optional, Type, TypeVar
import httpx
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from core.config import settings
from models.admin import AIUsageMetric
import logging

logger = logging.getLogger("careerpilot")
T = TypeVar("T", bound=BaseModel)


class BaseLLMProvider(ABC):
    """
    Abstract Base class for LLM Providers (OpenAI, Gemini).
    Isolates external API invocations from core business logic.
    """

    @abstractmethod
    async def generate(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None, 
        temperature: float = 0.7,
        db: Optional[AsyncSession] = None,
        user_id: Optional[Any] = None,
        **kwargs: Any
    ) -> str:
        """
        Send a text generation prompt. Returns the unstructured string response.
        """
        pass

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        db: Optional[AsyncSession] = None,
        user_id: Optional[Any] = None,
        **kwargs: Any
    ) -> T:
        """
        Send a text generation prompt. Parses output directly into a validated Pydantic model.
        """
        pass

    @abstractmethod
    async def embed_text(self, text: str) -> List[float]:
        """
        Compute embedding vector representation of text content.
        """
        pass


class OpenAIProvider(BaseLLMProvider):
    """
    OpenAI-specific concrete implementation with usage tracking.
    """
    async def generate(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None, 
        temperature: float = 0.7,
        db: Optional[AsyncSession] = None,
        user_id: Optional[Any] = None,
        **kwargs: Any
    ) -> str:
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API Key not configured.")

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        start_time = time.perf_counter()
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.OPENAI_DEFAULT_MODEL,
                    "messages": messages,
                    "temperature": temperature,
                    **kwargs
                }
            )
            
            latency_ms = int((time.perf_counter() - start_time) * 1000)
            
            if response.status_code == 200:
                result = response.json()
                text = result["choices"][0]["message"]["content"]
                
                # Extract token metrics
                usage = result.get("usage", {})
                in_tokens = usage.get("prompt_tokens", 0)
                out_tokens = usage.get("completion_tokens", 0)
                
                # Estimate costs ($5.00/1M input, $15.00/1M output)
                cost = (in_tokens * 0.000005) + (out_tokens * 0.000015)
                
                await self._log_usage(
                    db=db,
                    user_id=user_id,
                    provider="openai",
                    model_name=settings.OPENAI_DEFAULT_MODEL,
                    in_tokens=in_tokens,
                    out_tokens=out_tokens,
                    cost=cost,
                    latency=latency_ms,
                    status=200
                )
                return text
            else:
                await self._log_usage(
                    db=db,
                    user_id=user_id,
                    provider="openai",
                    model_name=settings.OPENAI_DEFAULT_MODEL,
                    in_tokens=0,
                    out_tokens=0,
                    cost=0.0,
                    latency=latency_ms,
                    status=response.status_code
                )
                raise Exception(f"OpenAI error status {response.status_code}: {response.text}")

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        db: Optional[AsyncSession] = None,
        user_id: Optional[Any] = None,
        **kwargs: Any
    ) -> T:
        # Request strict JSON response format
        raw_res = await self.generate(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=temperature,
            db=db,
            user_id=user_id,
            response_format={"type": "json_object"},
            **kwargs
        )
        return response_model.model_validate_json(raw_res)

    async def embed_text(self, text: str) -> List[float]:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/embeddings",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "text-embedding-3-small",
                    "input": text
                }
            )
            if response.status_code == 200:
                return response.json()["data"][0]["embedding"]
            raise Exception(f"OpenAI embedding failed: {response.text}")

    async def _log_usage(
        self,
        db: Optional[AsyncSession],
        user_id: Optional[Any],
        provider: str,
        model_name: str,
        in_tokens: int,
        out_tokens: int,
        cost: float,
        latency: int,
        status: int
    ):
        if not db:
            return
        try:
            metric = AIUsageMetric(
                user_id=user_id,
                provider=provider,
                model_name=model_name,
                input_tokens=in_tokens,
                output_tokens=out_tokens,
                cost_estimate=cost,
                latency_ms=latency,
                status_code=status
            )
            db.add(metric)
            await db.commit()
        except Exception as e:
            logger.error(f"Failed to record AI Usage Metric: {e}")


class GeminiProvider(BaseLLMProvider):
    """
    Google Gemini-specific concrete implementation with usage tracking.
    """
    async def generate(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None, 
        temperature: float = 0.7,
        db: Optional[AsyncSession] = None,
        user_id: Optional[Any] = None,
        **kwargs: Any
    ) -> str:
        if not settings.GEMINI_API_KEY:
            raise ValueError("Gemini API Key not configured.")

        # Gemini expects system instruction as part of systemInstruction node
        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
            }
        }
        
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        if kwargs.get("response_format", {}).get("type") == "json_object":
            payload["generationConfig"]["responseMimeType"] = "application/json"

        start_time = time.perf_counter()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_DEFAULT_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                headers={"Content-Type": "application/json"},
                json=payload
            )
            
            latency_ms = int((time.perf_counter() - start_time) * 1000)
            
            if response.status_code == 200:
                result = response.json()
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                
                # Extract token metrics
                usage = result.get("usageMetadata", {})
                in_tokens = usage.get("promptTokenCount", 0)
                out_tokens = usage.get("candidatesTokenCount", 0)
                
                # Estimate cost ($0.075/1M input, $0.30/1M output)
                cost = (in_tokens * 0.000000075) + (out_tokens * 0.00000030)
                
                await self._log_usage(
                    db=db,
                    user_id=user_id,
                    provider="gemini",
                    model_name=settings.GEMINI_DEFAULT_MODEL,
                    in_tokens=in_tokens,
                    out_tokens=out_tokens,
                    cost=cost,
                    latency=latency_ms,
                    status=200
                )
                return text
            else:
                await self._log_usage(
                    db=db,
                    user_id=user_id,
                    provider="gemini",
                    model_name=settings.GEMINI_DEFAULT_MODEL,
                    in_tokens=0,
                    out_tokens=0,
                    cost=0.0,
                    latency=latency_ms,
                    status=response.status_code
                )
                raise Exception(f"Gemini error status {response.status_code}: {response.text}")

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        db: Optional[AsyncSession] = None,
        user_id: Optional[Any] = None,
        **kwargs: Any
    ) -> T:
        raw_res = await self.generate(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=temperature,
            db=db,
            user_id=user_id,
            response_format={"type": "json_object"},
            **kwargs
        )
        return response_model.model_validate_json(raw_res)

    async def embed_text(self, text: str) -> List[float]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={settings.GEMINI_API_KEY}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                url,
                headers={"Content-Type": "application/json"},
                json={
                    "model": "models/text-embedding-004",
                    "content": {
                        "parts": [{"text": text}]
                    }
                }
            )
            if response.status_code == 200:
                return response.json()["embedding"]["values"]
            raise Exception(f"Gemini embedding failed: {response.text}")

    async def _log_usage(
        self,
        db: Optional[AsyncSession],
        user_id: Optional[Any],
        provider: str,
        model_name: str,
        in_tokens: int,
        out_tokens: int,
        cost: float,
        latency: int,
        status: int
    ):
        if not db:
            return
        try:
            metric = AIUsageMetric(
                user_id=user_id,
                provider=provider,
                model_name=model_name,
                input_tokens=in_tokens,
                output_tokens=out_tokens,
                cost_estimate=cost,
                latency_ms=latency,
                status_code=status
            )
            db.add(metric)
            await db.commit()
        except Exception as e:
            logger.error(f"Failed to record AI Usage Metric: {e}")


class FailoverLLMProvider(BaseLLMProvider):
    """
    Resilient provider wrapper that fails over to secondary LLM endpoints on timeout or rate limits.
    """
    def __init__(self):
        self.openai = OpenAIProvider()
        self.gemini = GeminiProvider()

    async def generate(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None, 
        temperature: float = 0.7,
        db: Optional[AsyncSession] = None,
        user_id: Optional[Any] = None,
        **kwargs: Any
    ) -> str:
        # Default strategy: OpenAI -> Gemini Failover
        try:
            logger.info("Attempting AI generation via primary provider (OpenAI)")
            return await self.openai.generate(
                prompt=prompt,
                system_instruction=system_instruction,
                temperature=temperature,
                db=db,
                user_id=user_id,
                **kwargs
            )
        except Exception as e:
            logger.warning(f"Primary OpenAI provider failed: {e}. Executing failover to Gemini...")
            try:
                return await self.gemini.generate(
                    prompt=prompt,
                    system_instruction=system_instruction,
                    temperature=temperature,
                    db=db,
                    user_id=user_id,
                    **kwargs
                )
            except Exception as gemini_err:
                logger.critical(f"Failover provider (Gemini) failed: {gemini_err}")
                raise Exception(f"AI Provider critical service failure. Both OpenAI and Gemini requests failed.")

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        db: Optional[AsyncSession] = None,
        user_id: Optional[Any] = None,
        **kwargs: Any
    ) -> T:
        try:
            logger.info("Attempting structured AI generation via primary provider (OpenAI)")
            return await self.openai.generate_structured(
                prompt=prompt,
                response_model=response_model,
                system_instruction=system_instruction,
                temperature=temperature,
                db=db,
                user_id=user_id,
                **kwargs
            )
        except Exception as e:
            logger.warning(f"Primary OpenAI structured generation failed: {e}. Executing failover to Gemini...")
            try:
                return await self.gemini.generate_structured(
                    prompt=prompt,
                    response_model=response_model,
                    system_instruction=system_instruction,
                    temperature=temperature,
                    db=db,
                    user_id=user_id,
                    **kwargs
                )
            except Exception as gemini_err:
                logger.critical(f"Failover structured provider (Gemini) failed: {gemini_err}")
                raise Exception(f"AI Provider structured critical failure. Both OpenAI and Gemini requests failed.")

    async def embed_text(self, text: str) -> List[float]:
        try:
            return await self.openai.embed_text(text)
        except Exception as e:
            logger.warning(f"Primary OpenAI embedding failed: {e}. Executing failover to Gemini text-embedding-004...")
            return await self.gemini.embed_text(text)


# Singleton AI client failover provider instance
ai_client = FailoverLLMProvider()
