from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str

    # Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Gemini AI
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Production Server
    WORKERS_COUNT: int = 4
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: str = "30"

    class Config:
        env_file = ".env"
        extra = "ignore"  # ignore unused env vars


settings = Settings()