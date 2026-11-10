from __future__ import annotations

import io
import uuid
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import UTC, datetime
from typing import Any

import pandas as pd
import pytest

from datashelf_etl.analytics import AnalyticsResult
from datashelf_etl.config import Settings
from datashelf_etl.contracts import ChartsComputedEvent, MetricChart
from datashelf_etl.io import s3
from datashelf_etl.io.loaders import DatasetError
from datashelf_etl.pipeline import (
    JobsFailedError,
    StagedDataset,
    build_event,
    publish_job,
    run_job,
    stage_dataset,
    summarize,
)

RUN_ID = "manual__2025-06-01T10:15:00+00:00"
OBJECT_KEY = "raw-data/retail-1748772900.csv"


def metric_result() -> AnalyticsResult:
    return AnalyticsResult(
        charts=[
            MetricChart(name="total_sales", title="Total Sales", description="", value=1.5, unit_sign="$")
        ],
        meta={"rows": 1},
    )


def test_build_event_fields() -> None:
    event_id = uuid.uuid4()
    occurred_at = datetime(2025, 6, 1, 10, 15, 30, tzinfo=UTC)

    event = build_event(
        job="retail_metrics",
        run_id=RUN_ID,
        object_key=OBJECT_KEY,
        result=metric_result(),
        processing_time_sec=0.1234567891,
        occurred_at=occurred_at,
        event_id=event_id,
    )

    assert event.event_id == event_id
    assert event.event_type == "dataset.charts.computed"
    assert event.schema_version == 1
    assert event.dataset.filename == "retail-1748772900.csv"
    assert event.dataset.object_key == OBJECT_KEY
    assert event.processing_time_sec == 0.123457
    assert event.meta == {"rows": 1}
    assert event.model_dump(mode="json")["occurred_at"] == "2025-06-01T10:15:30Z"


def test_build_event_defaults_are_unique_and_utc() -> None:
    first = build_event(
        job="seasons", run_id=RUN_ID, object_key=OBJECT_KEY, result=metric_result(), processing_time_sec=-1
    )
    second = build_event(
        job="seasons", run_id=RUN_ID, object_key=OBJECT_KEY, result=metric_result(), processing_time_sec=0
    )

    assert first.event_id != second.event_id
    assert first.event_id.version == 4
    assert first.occurred_at.utcoffset() is not None
    assert first.occurred_at.utcoffset().total_seconds() == 0  # type: ignore[union-attr]
    assert first.processing_time_sec == 0


def test_build_event_rejects_invalid_job() -> None:
    with pytest.raises(ValueError, match="job"):
        build_event(
            job="Bad-Job", run_id=RUN_ID, object_key=OBJECT_KEY, result=metric_result(), processing_time_sec=0
        )


def test_stage_dataset_writes_parquet(fake_s3: Any, settings: Settings, sample_csv_bytes: bytes) -> None:
    fake_s3.objects[("datashelf", OBJECT_KEY)] = sample_csv_bytes

    staged = stage_dataset(fake_s3, settings, OBJECT_KEY, RUN_ID)

    assert staged == StagedDataset(object_key=OBJECT_KEY, staging_key=f"staging/{RUN_ID}/dataset.parquet")
    assert StagedDataset.from_xcom(staged.to_xcom()) == staged
    df = pd.read_parquet(io.BytesIO(fake_s3.objects[("datashelf", staged.staging_key)]))
    assert len(df) == 30
    assert pd.api.types.is_datetime64_any_dtype(df["Date"])


@pytest.mark.parametrize("object_key", [None, "", "other/a.csv", "raw-data/../secret.csv", "raw-data/a.xlsx"])
def test_stage_dataset_rejects_bad_keys(fake_s3: Any, settings: Settings, object_key: object) -> None:
    with pytest.raises(DatasetError):
        stage_dataset(fake_s3, settings, object_key, RUN_ID)
    assert not fake_s3.put_calls


@pytest.fixture
def staged(fake_s3: Any, settings: Settings, retail_df: pd.DataFrame) -> StagedDataset:
    key = s3.staging_key(settings.s3_staging_prefix, RUN_ID)
    s3.write_parquet(fake_s3, settings.s3_bucket, key, retail_df)
    return StagedDataset(object_key=OBJECT_KEY, staging_key=key)


def test_run_job_builds_event(fake_s3: Any, settings: Settings, staged: StagedDataset) -> None:
    event = run_job("monthly_sales", fake_s3, settings, staged, RUN_ID)

    assert event.job == "monthly_sales"
    assert event.run_id == RUN_ID
    assert event.charts[0].name == "total_sales_by_month"
    assert event.processing_time_sec >= 0


def test_run_job_unknown(fake_s3: Any, settings: Settings, staged: StagedDataset) -> None:
    with pytest.raises(ValueError, match="Unknown analytics job"):
        run_job("nope", fake_s3, settings, staged, RUN_ID)


class RecordingPublisher:
    def __init__(self) -> None:
        self.events: list[ChartsComputedEvent] = []

    def publish(self, event: ChartsComputedEvent) -> None:
        self.events.append(event)


def test_publish_job(fake_s3: Any, settings: Settings, staged: StagedDataset) -> None:
    publisher = RecordingPublisher()

    @contextmanager
    def connect() -> Iterator[Any]:
        yield publisher

    result = publish_job("city_wordcloud", fake_s3, settings, staged, RUN_ID, connect)

    assert len(publisher.events) == 1
    assert result == {"job": "city_wordcloud", "event_id": str(publisher.events[0].event_id)}


def test_summarize_all_published() -> None:
    results = [{"job": "a", "event_id": "1"}, {"job": "b", "event_id": "2"}]
    assert summarize(["a", "b"], results) == ["a", "b"]


@pytest.mark.parametrize("results", [[{"job": "a"}, None], [{"job": "a"}], [], [None, "garbage"]])
def test_summarize_reports_failures(results: list[Any]) -> None:
    with pytest.raises(JobsFailedError, match=r"analytics jobs failed: \[.*'b'\]"):
        summarize(["a", "b"], results)
