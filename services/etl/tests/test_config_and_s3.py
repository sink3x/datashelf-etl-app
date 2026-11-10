from __future__ import annotations

import pytest
from pydantic import ValidationError

from datashelf_etl.config import Settings
from datashelf_etl.io import s3


def test_settings_from_env(settings: Settings) -> None:
    assert settings.s3_bucket == "datashelf"
    assert settings.s3_force_path_style is True
    assert settings.s3_region == "ru-central1"
    assert settings.s3_raw_prefix == "raw-data"
    assert settings.s3_staging_prefix == "staging"
    assert settings.rabbitmq_exchange == "datashelf.events"
    assert "guest" not in repr(settings)


def test_settings_require_bucket(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in ("S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "RABBITMQ_URL"):
        monkeypatch.delenv(name, raising=False)
    with pytest.raises(ValidationError, match="S3_BUCKET"):
        Settings(_env_file=None)  # type: ignore[call-arg]


def test_make_client_uses_settings(settings: Settings) -> None:
    client = s3.make_client(settings)

    assert client.meta.endpoint_url == "http://minio:9000"
    assert client.meta.region_name == "ru-central1"
    assert client.meta.config.s3 == {"addressing_style": "path"}


@pytest.mark.parametrize("key", ["raw-data/a.csv", "raw-data/nested/b.json"])
def test_validate_object_key_accepts(key: str) -> None:
    assert s3.validate_object_key(key, "raw-data/") == key


@pytest.mark.parametrize(
    "key", [None, 42, " ", "raw-data/", "raw-datax/a.csv", "/raw-data/a.csv", "raw-data/../a.csv"]
)
def test_validate_object_key_rejects(key: object) -> None:
    with pytest.raises(ValueError, match="object_key"):
        s3.validate_object_key(key, "raw-data")


def test_staging_key() -> None:
    assert s3.staging_key("/staging/", "run_1") == "staging/run_1/dataset.parquet"
