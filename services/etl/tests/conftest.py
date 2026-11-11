from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd
import pytest

from datashelf_etl.config import Settings
from datashelf_etl.io.loaders import FileType, normalize_retail, parse_dataset

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture
def sample_csv_bytes() -> bytes:
    return (FIXTURES / "retail_sample.csv").read_bytes()


@pytest.fixture
def retail_df(sample_csv_bytes: bytes) -> pd.DataFrame:
    return normalize_retail(parse_dataset(sample_csv_bytes, FileType.CSV))


@pytest.fixture
def settings(monkeypatch: pytest.MonkeyPatch) -> Settings:
    env = {
        "S3_ENDPOINT": "http://minio:9000",
        "S3_BUCKET": "datashelf",
        "S3_ACCESS_KEY_ID": "minioadmin",
        "S3_SECRET_ACCESS_KEY": "minioadmin",
        "S3_FORCE_PATH_STYLE": "true",
        "RABBITMQ_URL": "amqp://guest:guest@rabbitmq:5672/",
    }
    for key, value in env.items():
        monkeypatch.setenv(key, value)
    return Settings(_env_file=None)  # type: ignore[call-arg]


class FakeBody:
    def __init__(self, data: bytes) -> None:
        self._data = data

    def read(self) -> bytes:
        return self._data


class FakeS3:
    """In-memory stand-in for the subset of the boto3 S3 client the package uses."""

    def __init__(self, objects: dict[tuple[str, str], bytes] | None = None) -> None:
        self.objects: dict[tuple[str, str], bytes] = dict(objects or {})
        self.put_calls: list[dict[str, Any]] = []

    def get_object(self, *, Bucket: str, Key: str) -> dict[str, Any]:  # noqa: N803
        return {"Body": FakeBody(self.objects[(Bucket, Key)])}

    def put_object(self, *, Bucket: str, Key: str, Body: bytes, **kwargs: Any) -> dict[str, Any]:  # noqa: N803
        self.objects[(Bucket, Key)] = Body
        self.put_calls.append({"Bucket": Bucket, "Key": Key, **kwargs})
        return {}


@pytest.fixture
def fake_s3() -> FakeS3:
    return FakeS3()
