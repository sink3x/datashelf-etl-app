"""Top products per season."""

from __future__ import annotations

import re
from collections import Counter
from typing import Any

import pandas as pd

from datashelf_etl.analytics.base import AnalyticsResult, percentage
from datashelf_etl.contracts import SeriesChart

TOP_N = 5


def parse_products(raw: str) -> list[str]:
    """Split a basket stored as a Python-list literal (`"['Milk', 'Bread']"`) or a comma-separated string."""
    cleaned = raw.replace("[", "").replace("]", "").replace("'", "").replace('"', "")
    return [product.strip() for product in cleaned.split(",") if product.strip()]


def product_counts_by_season(df: pd.DataFrame) -> dict[str, Counter[str]]:
    """Product frequencies per season, seasons in order of first appearance."""
    result: dict[str, Counter[str]] = {}
    for season, product in df[["Season", "Product"]].dropna(subset=["Season"]).itertuples(index=False):
        counts = result.setdefault(str(season), Counter())
        if isinstance(product, str):
            counts.update(parse_products(product))
    return result


def season_slug(season: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", season.lower()).strip("_") or "unknown"


def top_products_chart(season: str, counts: Counter[str], *, with_season: bool) -> SeriesChart:
    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    top = ranked[:TOP_N]
    total = sum(counts.values())
    top_label, top_count = ranked[0] if ranked else (None, 0)
    slug = season_slug(season)
    data: dict[str, Any] = {
        "name": f"top5_products_{slug}",
        "title": f"Top 5 Products in {season}",
        "description": f"Top 5 most frequent products sold in the {season} season.",
        "type": "bar",
        "labels": [label for label, _ in top],
        "values": [count for _, count in top],
        "total": total,
        "top": {"label": top_label, "count": top_count, "percentage": percentage(top_count, total)},
    }
    if with_season:
        data = {"season": slug, **data}
    return SeriesChart.model_validate(data)


def seasons_meta(by_season: dict[str, Counter[str]]) -> dict[str, Any]:
    products: set[str] = set().union(*by_season.values()) if by_season else set()
    return {
        "seasons": list(by_season),
        "total_seasons": len(by_season),
        "total_unique_products": len(products),
    }


def seasons(df: pd.DataFrame) -> AnalyticsResult:
    by_season = product_counts_by_season(df)
    charts = [top_products_chart(season, counts, with_season=True) for season, counts in by_season.items()]
    return AnalyticsResult(
        charts=list(charts),
        meta={**seasons_meta(by_season), "data_columns": ["Product", "Count"]},
    )
