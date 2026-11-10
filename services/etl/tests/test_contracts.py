from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pandas as pd
import pytest
from jsonschema import Draft202012Validator
from pydantic import ValidationError

from datashelf_etl.analytics import JOBS
from datashelf_etl.contracts import ChartsComputedEvent
from datashelf_etl.pipeline import build_event

CONTRACTS = Path(__file__).resolve().parents[3] / "packages" / "contracts"
SCHEMA_PATH = CONTRACTS / "schemas" / "charts-computed.v1.schema.json"
VALID_FIXTURES = sorted((CONTRACTS / "fixtures" / "valid").glob("*.json"))
INVALID_FIXTURES = sorted((CONTRACTS / "fixtures" / "invalid").glob("*.json"))


@pytest.fixture(scope="module")
def validator() -> Draft202012Validator:
    schema = json.loads(SCHEMA_PATH.read_text())
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema, format_checker=Draft202012Validator.FORMAT_CHECKER)


def load(path: Path) -> dict[str, Any]:
    data: dict[str, Any] = json.loads(path.read_text())
    return data


def test_fixtures_present() -> None:
    assert VALID_FIXTURES
    assert INVALID_FIXTURES


@pytest.mark.parametrize("job", sorted(JOBS))
def test_produced_events_match_json_schema(
    job: str, retail_df: pd.DataFrame, validator: Draft202012Validator
) -> None:
    event = build_event(
        job=job,
        run_id="manual__2025-06-01T10:15:00+00:00",
        object_key="raw-data/retail.csv",
        result=JOBS[job](retail_df),
        processing_time_sec=0.01,
    )
    payload = json.loads(event.model_dump_json())

    errors = sorted(validator.iter_errors(payload), key=lambda error: list(error.path))
    assert not errors, [f"{list(error.path)}: {error.message}" for error in errors]


@pytest.mark.parametrize("path", VALID_FIXTURES, ids=lambda path: path.name)
def test_valid_fixtures_load_and_round_trip(path: Path, validator: Draft202012Validator) -> None:
    event = ChartsComputedEvent.model_validate(load(path))
    dumped = json.loads(event.model_dump_json())

    assert not list(validator.iter_errors(dumped))
    assert dumped["charts"] == load(path)["charts"]


@pytest.mark.parametrize("path", INVALID_FIXTURES, ids=lambda path: path.name)
def test_invalid_fixtures_are_rejected(path: Path, validator: Draft202012Validator) -> None:
    assert list(validator.iter_errors(load(path)))
    with pytest.raises(ValidationError):
        ChartsComputedEvent.model_validate(load(path))
