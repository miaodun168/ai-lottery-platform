from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AI Lottery Platform"
    app_env: str = "development"
    secret_key: str = "change-me"

    database_url: str
    redis_url: str = "redis://localhost:6379/0"

    openai_api_key: str = ""
    ai_model: str = "gpt-4o"

    class Config:
        env_file = ".env"


settings = Settings()
