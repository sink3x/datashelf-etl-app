from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

import pandas as pd

from datashelf_etl.contracts import Chart


@dataclass(frozen=True)
class AnalyticsResult:
    charts: list[Chart]
    meta: dict[str, Any] = field(default_factory=dict)


Analysis = Callable[[pd.DataFrame], AnalyticsResult]


def percentage(part: float, total: float) -> float:
    return round(100 * part / total, 2) if total > 0 else 0


def counts_desc(series: pd.Series[Any]) -> pd.Series[int]:
    """Value counts ordered by count desc, then label asc, so ties are deterministic."""
    counts = series.dropna().astype(str).value_counts()
    frame = counts.rename_axis("label").reset_index(name="count")
    frame = frame.sort_values(["count", "label"], ascending=[False, True], kind="stable")
    return pd.Series(frame["count"].astype(int).to_numpy(), index=frame["label"].to_numpy())


def count_stats(counts: pd.Series[int]) -> dict[str, float]:
    if counts.empty:
        return {"min": 0, "max": 0, "mean": 0, "median": 0}
    return {
        "min": int(counts.min()),
        "max": int(counts.max()),
        "mean": round(float(counts.mean()), 2),
        "median": int(counts.median()),
    }
