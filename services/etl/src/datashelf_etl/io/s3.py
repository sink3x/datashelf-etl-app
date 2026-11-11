"""S3 access: raw uploads in, staged parquet out."""

from __future__ import annotations

import io
from pathlib import PurePosixPath
from typing import TYPE_CHECKING

import boto3
import pandas as pd
from botocore.config import Config

from datashelf_etl.io.loaders import DatasetError

if TYPE_CHECKING:
    from mypy_boto3_s3 import S3Client

    from datashelf_etl.config import Settings

STAGING_FILENAME = "dataset.parquet"


def make_client(settings: Settings) -> S3Client:
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint,
        region_name=settings.s3_region,
        aws_access_key_id=settings.s3_access_key_id.get_secret_value(),
        aws_secret_access_key=settings.s3_secret_access_key.get_secret_value(),
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path" if settings.s3_force_path_style else "auto"},
            retries={"max_attempts": 5, "mode": "standard"},
        ),
    )


def validate_object_key(object_key: object, raw_prefix: str) -> str:
    """Accept only keys of uploaded files under the raw prefix; reject anything that could escape it."""
    if not isinstance(object_key, str) or not object_key.strip():
        raise DatasetError("dag_run.conf.object_key must be a non-empty string")
    prefix = raw_prefix.strip("/") + "/"
    parts = PurePosixPath(object_key).parts
    if not object_key.startswith(prefix) or ".." in parts or object_key.endswith("/"):
        raise DatasetError(f"object_key {object_key!r} must point to a file under {prefix!r}")
    return object_key


def staging_key(staging_prefix: str, run_id: str) -> str:
    return f"{staging_prefix.strip('/')}/{run_id}/{STAGING_FILENAME}"


def read_object(client: S3Client, bucket: str, key: str) -> bytes:
    response = client.get_object(Bucket=bucket, Key=key)
    return response["Body"].read()


def write_parquet(client: S3Client, bucket: str, key: str, df: pd.DataFrame) -> None:
    buffer = io.BytesIO()
    df.to_parquet(buffer, engine="pyarrow", index=False)
    client.put_object(
        Bucket=bucket, Key=key, Body=buffer.getvalue(), ContentType="application/vnd.apache.parquet"
    )


def read_parquet(client: S3Client, bucket: str, key: str) -> pd.DataFrame:
    return pd.read_parquet(io.BytesIO(read_object(client, bucket, key)), engine="pyarrow")
