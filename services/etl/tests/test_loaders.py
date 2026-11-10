from __future__ import annotations

import json

import pandas as pd
import pytest

from datashelf_etl.io.loaders import (
    REQUIRED_COLUMNS,
    DatasetError,
    FileType,
    detect_file_type,
    normalize_retail,
    parse_dataset,
)


def test_detect_file_type() -> None:
    assert detect_file_type("raw-data/a.CSV") is FileType.CSV
    assert detect_file_type("raw-data/a.json") is FileType.JSON
    with pytest.raises(DatasetError, match="Unsupported file type"):
        detect_file_type("raw-data/a.xlsx")


def test_parse_csv(sample_csv_bytes: bytes) -> None:
    df = parse_dataset(sample_csv_bytes, FileType.CSV)
    assert len(df) == 30
    assert set(REQUIRED_COLUMNS) <= set(df.columns)


def test_parse_json_array_and_object(sample_csv_bytes: bytes) -> None:
    records = parse_dataset(sample_csv_bytes, FileType.CSV).head(3).to_dict(orient="records")

    from_array = parse_dataset(json.dumps(records).encode(), FileType.JSON)
    from_object = parse_dataset(json.dumps(records[0]).encode(), FileType.JSON)

    assert len(from_array) == 3
    assert len(from_object) == 1
    assert len(normalize_retail(from_array)) == 3


@pytest.mark.parametrize(
    ("content", "file_type", "message"),
    [
        (b"", FileType.CSV, "empty"),
        (b"  \n", FileType.JSON, "empty"),
        (b"{not json", FileType.JSON, "Invalid JSON"),
        (b"[1, 2]", FileType.JSON, "array of objects"),
        (b'"text"', FileType.JSON, "array of objects"),
        (b'a,b\n1,2,3,4\n"unterminated', FileType.CSV, "Invalid CSV"),
    ],
)
def test_parse_invalid(content: bytes, file_type: FileType, message: str) -> None:
    with pytest.raises(DatasetError, match=message):
        parse_dataset(content, file_type)


def test_normalize_coerces_types(retail_df: pd.DataFrame) -> None:
    assert pd.api.types.is_datetime64_any_dtype(retail_df["Date"])
    assert pd.api.types.is_numeric_dtype(retail_df["Total_Cost"])
    assert pd.api.types.is_numeric_dtype(retail_df["Total_Items"])
    assert retail_df["City"].dtype == "string"
    assert retail_df["Transaction_ID"].dtype == "string"


def test_normalize_reports_missing_columns(retail_df: pd.DataFrame) -> None:
    with pytest.raises(DatasetError, match=r"Missing required columns: \['Total_Cost', 'City'\]"):
        normalize_retail(retail_df.drop(columns=["City", "Total_Cost"]))


def test_normalize_rejects_empty_dataset(retail_df: pd.DataFrame) -> None:
    with pytest.raises(DatasetError, match="no rows"):
        normalize_retail(retail_df.head(0))


def test_normalize_rejects_blank_required_column(retail_df: pd.DataFrame) -> None:
    with pytest.raises(DatasetError, match=r"Required columns have no values: \['Total_Cost'\]"):
        normalize_retail(retail_df.assign(Total_Cost=None))


def test_normalize_drops_blank_rows(retail_df: pd.DataFrame) -> None:
    blank = pd.DataFrame([dict.fromkeys(retail_df.columns)])
    assert len(normalize_retail(pd.concat([retail_df, blank], ignore_index=True))) == 30


@pytest.mark.parametrize(
    ("column", "bad_value", "expected"),
    [("Total_Cost", "abc", "numeric"), ("Date", "not a date", "a date")],
)
def test_normalize_rejects_bad_types(
    retail_df: pd.DataFrame, column: str, bad_value: str, expected: str
) -> None:
    raw = retail_df.astype({column: "object"})
    raw.loc[3, column] = bad_value
    with pytest.raises(
        DatasetError, match=rf"Column '{column}' must be {expected}; invalid values at rows \[3\]"
    ):
        normalize_retail(raw)
