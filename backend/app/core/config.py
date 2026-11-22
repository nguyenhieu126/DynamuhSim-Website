from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="PBL6_", env_file=".env", extra="ignore")
    data_mode: Literal["demo", "live"] = "demo"
    robot_name: str = "PBL6-01"
    cors_origins: list[str] = [
        "http://localhost:8080", "http://127.0.0.1:8080",
        "http://localhost:5173", "http://127.0.0.1:5173",
    ]
    settings_file: Path = Path("data/demo-settings.json")
