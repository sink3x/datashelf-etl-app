"""Orchestration-agnostic pipeline steps; the Airflow DAG only wires these together."""

from __future__ import annotations

import logging
import time
import uuid
from collections.abc import Callable, Iterable, Mapping, Sequence
from contextlib import AbstractContextManager
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import PurePosixPath
from typing import TYPE_CHECKING

from datashelf_etl.analytics import JOBS, AnalyticsResult
from datashelf_etl.contracts import ChartsComputedEvent, Dataset
from datashelf_etl.io import s3
from datashelf_etl.io.loaders import DatasetError, detect_file_type, normalize_retail, parse_dataset

if TYPE_CHECKING:
    from mypy_boto3_s3 import S3Client

    from datashelf_etl.config import Settings
    from datashelf_etl.messaging.publisher import EventPublisher

logger = logging.getLogger(__name__)


class JobsFailedError(RuntimeError):
    """At least one analytics job did not publish its event."""


@dataclass(frozen=True)
class StagedDataset:
    """Small, XCom-friendly pointer to a dataset staged as parquet."""

    object_key: str
    staging_key: str

    def to_xcom(self) -> dict[str, str]:
        return asdict(self)

    @classmethod
    def from_xcom(cls, value: Mapping[str, str]) -> StagedDataset:
        return cls(object_key=value["object_key"], staging_key=value["staging_key"])


def stage_dataset(client: S3Client, settings: Settings, raw_object_key: object, run_id: str) -> StagedDataset:
    """Read the raw upload, validate and normalize it, and store it as parquet for the analytics tasks."""
    object_key = s3.validate_object_key(raw_object_key, settings.s3_raw_prefix)
    file_type = detect_file_type(object_key)
    content = s3.read_object(client, settings.s3_bucket, object_key)
    df = normalize_retail(parse_dataset(content, file_type))
    key = s3.staging_key(settings.s3_staging_prefix, run_id)
    s3.write_parquet(client, settings.s3_bucket, key, df)
    logger.info("Staged %d rows from %s to s3://%s/%s", len(df), object_key, settings.s3_bucket, key)
    return StagedDataset(object_key=object_key, staging_key=key)


def build_event(
    *,
    job: str,
    run_id: str,
    object_key: str,
    result: AnalyticsResult,
    processing_time_sec: float,
    occurred_at: datetime | None = None,
    event_id: uuid.UUID | None = None,
) -> ChartsComputedEvent:
    return ChartsComputedEvent(
        event_id=event_id or uuid.uuid4(),
        occurred_at=occurred_at or datetime.now(UTC),
        run_id=run_id,
        job=job,
        dataset=Dataset(object_key=object_key, filename=PurePosixPath(object_key).name),
        processing_time_sec=round(max(processing_time_sec, 0.0), 6),
        meta=result.meta,
        charts=result.charts,
    )


def run_job(
    job: str, client: S3Client, settings: Settings, staged: StagedDataset, run_id: str
) -> ChartsComputedEvent:
    try:
        analysis = JOBS[job]
    except KeyError:
        raise ValueError(f"Unknown analytics job {job!r}; known jobs: {sorted(JOBS)}") from None
    df = s3.read_parquet(client, settings.s3_bucket, staged.staging_key)
    started = time.perf_counter()
    result = analysis(df)
    elapsed = time.perf_counter() - started
    if not result.charts:
        raise DatasetError(f"Job {job!r} produced no charts for {staged.object_key!r}")
    return build_event(
        job=job,
        run_id=run_id,
        object_key=staged.object_key,
        result=result,
        processing_time_sec=elapsed,
    )


def publish_job(
    job: str,
    client: S3Client,
    settings: Settings,
    staged: StagedDataset,
    run_id: str,
    connect: Callable[[], AbstractContextManager[EventPublisher]],
) -> dict[str, str]:
    """Compute first, connect afterwards, so a slow analysis cannot starve the broker heartbeat."""
    event = run_job(job, client, settings, staged, run_id)
    with connect() as publisher:
        publisher.publish(event)
    logger.info(
        "Published %s for job=%s run_id=%s (%d charts)", event.event_id, job, run_id, len(event.charts)
    )
    return {"job": job, "event_id": str(event.event_id)}


def summarize(jobs: Sequence[str], results: Iterable[object]) -> list[str]:
    """Return the published jobs or raise listing those without a result (failed or never ran).

    `results` are the XCom values returned by `publish_job`; missing entries may be absent or `None`.
    """
    published = {result["job"] for result in results if isinstance(result, Mapping) and "job" in result}
    succeeded = [job for job in jobs if job in published]
    failed = [job for job in jobs if job not in published]
    logger.info("Published jobs: %s", succeeded or "none")
    if failed:
        raise JobsFailedError(f"{len(failed)} of {len(jobs)} analytics jobs failed: {failed}")
    return succeeded
