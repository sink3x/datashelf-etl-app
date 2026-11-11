from __future__ import annotations

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration read from environment variables (names are part of the deployment contract)."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    s3_endpoint: str | None = Field(default=None, alias="S3_ENDPOINT")
    s3_region: str = Field(default="ru-central1", alias="S3_REGION")
    s3_bucket: str = Field(alias="S3_BUCKET", min_length=1)
    s3_access_key_id: SecretStr = Field(alias="S3_ACCESS_KEY_ID")
    s3_secret_access_key: SecretStr = Field(alias="S3_SECRET_ACCESS_KEY")
    s3_force_path_style: bool = Field(default=False, alias="S3_FORCE_PATH_STYLE")
    s3_raw_prefix: str = Field(default="raw-data", alias="S3_RAW_PREFIX")
    s3_staging_prefix: str = Field(default="staging", alias="S3_STAGING_PREFIX")

    rabbitmq_url: SecretStr = Field(alias="RABBITMQ_URL")
    rabbitmq_exchange: str = Field(default="datashelf.events", alias="RABBITMQ_EXCHANGE")
