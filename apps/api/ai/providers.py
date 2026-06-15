from abc import ABC, abstractmethod
from typing import Any, Dict, Type, TypeVar
from pydantic import BaseModel

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
