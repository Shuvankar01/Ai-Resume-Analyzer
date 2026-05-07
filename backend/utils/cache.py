import redis
from config import settings
from functools import wraps
from utils.serializer import redis_dumps, redis_loads

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

def cache_response(expiration: int = 3600):
    """
    Simple caching decorator for synchronous functions or endpoints.
    In FastAPI, it's often better to cache within the route logic,
    but this is a generic utility.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Very basic cache key based on function name and args
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            cached_value = redis_client.get(cache_key)
            if cached_value:
                return redis_loads(cached_value)
            
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, expiration, redis_dumps(result))
            return result
        return wrapper
    return decorator

def get_cached_analysis(resume_id: int, job_id: int):
    key = f"analysis:{resume_id}:{job_id}"
    data = redis_client.get(key)
    if data:
        return redis_loads(data)
    return None

def set_cached_analysis(resume_id: int, job_id: int, data: dict, exp=3600):
    key = f"analysis:{resume_id}:{job_id}"
    redis_client.setex(
    key,
    exp,
    redis_dumps(data)
)
