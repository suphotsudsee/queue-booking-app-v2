from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
from typing import List, Any
import json

class Settings(BaseSettings):
    db_host: str = Field(default="localhost", alias="DB_HOST")
    db_port: int = Field(default=3306, alias="DB_PORT")
    db_user: str = Field(default="root", alias="DB_USER")
    db_password: str = Field(default="password", alias="DB_PASSWORD")
    db_name: str = Field(default="queue_db", alias="DB_NAME")

    app_secret: str = Field(default="CHANGE_ME", alias="APP_SECRET")
    admin_email: str = Field(default="admin@example.com", alias="ADMIN_EMAIL")
    admin_password: str = Field(default="admin123", alias="ADMIN_PASSWORD")

    allowed_origins: List[str] = Field(default=["*"], alias="ALLOWED_ORIGINS")
    line_notify_token: str = Field(default="", alias="LINE_NOTIFY_TOKEN")

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _coerce_allowed_origins(cls, v: Any) -> List[str]:
        """
        รองรับรูปแบบ:
        - "*"
        - "http://localhost:3000"
        - "http://a.com,http://b.com"
        - '["http://a.com","http://b.com"]'
        """
        if v is None or v == "":
            return ["*"]
        if isinstance(v, list):
            return [str(x).strip() for x in v if str(x).strip()]
        if isinstance(v, str):
            s = v.strip()
            if s == "*":
                return ["*"]
            if s.startswith("["):
                try:
                    arr = json.loads(s)
                    return [str(x).strip() for x in arr if str(x).strip()]
                except Exception:
                    pass
            # คอมมาเซพาเรต
            return [x.strip() for x in s.split(",") if x.strip()]
        # fallback
        return ["*"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()