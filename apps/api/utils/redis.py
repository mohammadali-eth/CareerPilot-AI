import json
from typing import Any, Optional
import redis.asyncio as aioredis
from core.config import settings
import logging

logger = logging.getLogger("careerpilot")

class RedisManager:
    """
    Asynchronous Redis connection pooling manager with key namespaces.
    """
    def __init__(self):
        self.pool: Optional[aioredis.ConnectionPool] = None

    def connect(self) -> None:
        """
        Initialize the connection pool.
        """
        logger.info(f"Connecting to Redis pool at: {settings.REDIS_URL}")
        self.pool = aioredis.ConnectionPool.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            max_connections=50,
            socket_timeout=5.0,
            retry_on_timeout=True
        )

    async def disconnect(self) -> None:
        """
        Gracefully close connection pool.
        """
        if self.pool:
            await self.pool.disconnect()
            logger.info("Redis connection pool closed.")

    def get_client(self) -> aioredis.Redis:
        """
        Retrieve a connection client from pool.
        """
        if not self.pool:
            self.connect()
        return aioredis.Redis(connection_pool=self.pool)

    # --- Cache API Actions ---
    async def get(self, namespace: str, key: str) -> Optional[Any]:
        client = self.get_client()
        try:
            val = await client.get(f"{namespace}:{key}")
            if val:
                return json.loads(val)
        except Exception as e:
            logger.error(f"Redis get failed on {namespace}:{key}: {e}")
        finally:
            await client.close()
        return None

    async def set(self, namespace: str, key: str, value: Any, ttl: int = 3600) -> bool:
        client = self.get_client()
        try:
            serialized = json.dumps(value)
            await client.setex(f"{namespace}:{key}", ttl, serialized)
            return True
        except Exception as e:
            logger.error(f"Redis set failed on {namespace}:{key}: {e}")
        finally:
            await client.close()
        return False

    async def delete(self, namespace: str, key: str) -> bool:
        client = self.get_client()
        try:
            await client.delete(f"{namespace}:{key}")
            return True
        except Exception as e:
            logger.error(f"Redis delete failed on {namespace}:{key}: {e}")
        finally:
            await client.close()
        return False

    # --- Rate Limiter Actions ---
    async def is_rate_limited(self, identifier: str, limit: int, window_sec: int) -> bool:
        """
        Standard rate limit checking using sliding/fixed window rate limit counter.
        """
        client = self.get_client()
        key = f"ratelimit:{identifier}"
        try:
            # Multi pipeline transaction for atomicity
            pipe = client.pipeline()
            await pipe.incr(key)
            await pipe.ttl(key)
            results = await pipe.execute()
            
            count = results[0]
            ttl = results[1]

            if count == 1 or ttl == -1:
                # Set initial TTL
                await client.expire(key, window_sec)
            
            if count > limit:
                return True
        except Exception as e:
            logger.error(f"Redis rate limit validation failed for {identifier}: {e}")
        finally:
            await client.close()
        return False

redis_manager = RedisManager()
