import json
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel
from typing import Any

class ProductionJSONEncoder(json.JSONEncoder):
    """
    Advanced JSON Encoder that handles:
    - datetime/date -> ISO string
    - UUID -> string
    - Decimal -> float
    - Pydantic models -> dict
    """
    def default(self, obj: Any) -> Any:
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, BaseModel):
            return obj.model_dump()
        return super().default(obj)

def redis_dumps(data: Any) -> str:
    """Safely serialize data for Redis storage."""
    return json.dumps(data, cls=ProductionJSONEncoder)

def redis_loads(data: str) -> Any:
    """Safely deserialize data from Redis storage."""
    if not data:
        return None
    try:
        return json.loads(data)
    except (TypeError, json.JSONDecodeError):
        return None
