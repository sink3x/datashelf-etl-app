"""Parsing of raw uploads and validation of the retail dataset schema."""

from __future__ import annotations

import io
import json
from enum import StrEnum
from pathlib import PurePosixPath
from typing import Any

import pandas as pd


class DatasetError(ValueError):
    """The input dataset cannot be processed; retrying will not help."""


class FileType(StrEnum):
    CSV = "csv"
    JSON = "json"


DATETIME_COLUMNS: tuple[str, ...] = ("Date",)
NUMERIC_COLUMNS: tuple[str, ...] = ("Total_Items", "Total_Cost")
STRING_COLUMNS: tuple[str, ...] = (
    "Transaction_ID",
    "Customer_Name",
    "Product",
    "Payment_Method",
    "City",
    "Store_Type",
    "Customer_Category",
    "Season",
)
REQUIRED_COLUMNS: tuple[str, ...] = DATETIME_COLUMNS + NUMERIC_COLUMNS + STRING_COLUMNS


def detect_file_type(object_key: str) -> FileType:
    suffix = PurePosixPath(object_key).suffix.lower().lstrip(".")
    try:
        return FileType(suffix)
    except ValueError:
        raise DatasetError(
            f"Unsupported file type {suffix!r} for {object_key!r}; expected .csv or .json"
        ) from None


def parse_dataset(content: bytes, file_type: FileType) -> pd.DataFrame:
    if not content.strip():
        raise DatasetError("Dataset file is empty")
    if file_type is FileType.CSV:
        return _parse_csv(content)
    return _parse_json(content)


def _parse_csv(content: bytes) -> pd.DataFrame:
    try:
        return pd.read_csv(io.BytesIO(content))
    except (pd.errors.ParserError, pd.errors.EmptyDataError, UnicodeDecodeError) as exc:
        raise DatasetError(f"Invalid CSV: {exc}") from exc


def _parse_json(content: bytes) -> pd.DataFrame:
    try:
        parsed: Any = json.loads(content)
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise DatasetError(f"Invalid JSON: {exc}") from exc
    if isinstance(parsed, dict):
        parsed = [parsed]
    if not isinstance(parsed, list) or not all(isinstance(row, dict) for row in parsed):
        raise DatasetError("JSON dataset must be an object or an array of objects")
    return pd.DataFrame.from_records(parsed)


def normalize_retail(df: pd.DataFrame) -> pd.DataFrame:
    """Validate required columns and coerce them to the types the analytics expect."""
    missing = [column for column in REQUIRED_COLUMNS if column not in df.columns]
    if missing:
        raise DatasetError(f"Missing required columns: {missing}. Available columns: {df.columns.tolist()}")

    df = df.dropna(how="all").reset_index(drop=True)
    if df.empty:
        raise DatasetError("Dataset contains no rows")

    empty = [column for column in REQUIRED_COLUMNS if df[column].isna().all()]
    if empty:
        raise DatasetError(f"Required columns have no values: {empty}")

    out = df.copy()
    for column in DATETIME_COLUMNS:
        out[column] = pd.to_datetime(out[column], errors="coerce", format="mixed")
        _ensure_coerced(df, out, column, "a date")
    for column in NUMERIC_COLUMNS:
        out[column] = pd.to_numeric(out[column], errors="coerce")
        _ensure_coerced(df, out, column, "numeric")
    for column in STRING_COLUMNS:
        out[column] = out[column].astype("string")
    for column in df.columns.difference(list(REQUIRED_COLUMNS)):
        if out[column].dtype == object:
            out[column] = out[column].astype("string")
    return out


def _ensure_coerced(raw: pd.DataFrame, coerced: pd.DataFrame, column: str, expected: str) -> None:
    invalid = coerced[column].isna() & raw[column].notna()
    if invalid.any():
        rows = invalid[invalid].index[:5].tolist()
        raise DatasetError(f"Column {column!r} must be {expected}; invalid values at rows {rows}")
