from __future__ import annotations

from typing import Any

import pandas as pd
import pytest

from datashelf_etl.analytics import JOBS
from datashelf_etl.analytics.distributions import (
    city_wordcloud,
    customer_category,
    customer_category_wordcloud,
    payment_methods,
    store_type,
)
from datashelf_etl.analytics.retail_metrics import retail_metrics
from datashelf_etl.analytics.sales import city_sales_summary, monthly_sales
from datashelf_etl.analytics.seasons import parse_products, season_slug, seasons
from datashelf_etl.contracts import Chart


def dump(chart: Chart) -> dict[str, Any]:
    return chart.model_dump(mode="json")


def by_name(charts: list[Chart]) -> dict[str, dict[str, Any]]:
    return {chart.name: dump(chart) for chart in charts}


def test_customer_category_pie(retail_df: pd.DataFrame) -> None:
    result = customer_category(retail_df)
    chart = dump(result.charts[0])

    assert chart["name"] == "customer_category_distribution_pie"
    assert chart["type"] == "pie"
    assert chart["labels"] == ["Student", "Professional", "Retiree", "Young Adult"]
    assert chart["values"] == [11, 8, 7, 4]
    assert chart["total"] == 30
    assert chart["top"] == {"label": "Student", "count": 11, "percentage": 36.67}
    assert chart["categories_summary"][-1] == {"label": "Young Adult", "count": 4, "percentage": 13.33}
    assert chart["palette"][0] == "#FF6384"
    assert result.meta == {
        "total_categories": 4,
        "total_customers": 30,
        "data_columns": ["Customer_Category", "Count"],
        "unique_labels": ["Professional", "Retiree", "Student", "Young Adult"],
        "min_category_size": 4,
        "max_category_size": 11,
        "mean_category_size": 7.5,
        "median_category_size": 7,
    }


def test_payment_methods_pie(retail_df: pd.DataFrame) -> None:
    result = payment_methods(retail_df)
    chart = dump(result.charts[0])

    assert chart["name"] == "payment_method_distribution_pie"
    assert chart["labels"] == ["Cash", "Credit Card", "Mobile Payment"]
    assert chart["values"] == [15, 9, 6]
    assert chart["top"]["percentage"] == 50.0
    assert len(chart["payment_methods_summary"]) == 3
    assert result.meta["total_payment_methods"] == 3
    assert result.meta["max_payment_count"] == 15


def test_store_type_pie(retail_df: pd.DataFrame) -> None:
    result = store_type(retail_df)
    chart = dump(result.charts[0])

    assert chart["name"] == "store_type_distribution_pie"
    assert chart["values"] == [16, 9, 5]
    assert chart["store_types_summary"][0]["label"] == "Supermarket"
    assert result.meta["total_stores"] == 30
    assert result.meta["min_store_size"] == 5


def test_city_wordcloud(retail_df: pd.DataFrame) -> None:
    result = city_wordcloud(retail_df)
    chart = dump(result.charts[0])

    assert chart["name"] == "city_wordcloud_data"
    assert chart["type"] == "frequency"
    assert chart["labels"] == ["Boston", "Chicago", "Houston"]
    assert chart["values"] == [12, 10, 8]
    assert chart["top"] == {"label": "Boston", "count": 12, "percentage": 40.0}
    assert result.meta["unique_cities"] == ["Boston", "Chicago", "Houston"]
    assert result.meta["mean_city_count"] == 10.0


def test_customer_category_wordcloud(retail_df: pd.DataFrame) -> None:
    result = customer_category_wordcloud(retail_df)
    chart = dump(result.charts[0])

    assert chart["name"] == "customer_category_wordcloud_data"
    assert chart["type"] == "frequency"
    assert chart["total"] == 30
    assert result.meta["total_unique_categories"] == 4
    assert result.meta["total_entries"] == 30


def test_frequency_on_column_without_values() -> None:
    df = pd.DataFrame({"City": pd.Series([None, None], dtype="string")})
    chart = dump(city_wordcloud(df).charts[0])

    assert chart["labels"] == []
    assert chart["top"] == {"label": None, "count": None, "percentage": 0}


def test_city_sales_summary(retail_df: pd.DataFrame) -> None:
    result = city_sales_summary(retail_df)
    chart = dump(result.charts[0])
    expected = retail_df.groupby("City")["Total_Cost"].sum().sort_values(ascending=False)

    assert chart["name"] == "city_sales_summary"
    assert chart["type"] == "grouped"
    assert chart["labels"] == expected.index.tolist()
    assert chart["values_sum"] == pytest.approx(expected.tolist())
    assert sum(chart["values_count"]) == 30
    assert chart["top"]["label"] == expected.index[0]
    assert chart["top"]["sales_percentage"] == round(100 * expected.iloc[0] / 735, 2)
    assert result.meta["total_sales"] == 735.0
    assert result.meta["total_entries"] == 30


def test_monthly_sales(retail_df: pd.DataFrame) -> None:
    result = monthly_sales(retail_df)
    chart = dump(result.charts[0])

    assert chart["name"] == "total_sales_by_month"
    assert chart["type"] == "line"
    assert chart["labels"] == ["2024-01", "2024-02", "2024-03"]
    assert chart["values"] == [235.0, 245.0, 255.0]
    assert result.meta["date_range"] == {"start": "2024-01-01T00:00:00", "end": "2024-03-01T00:00:00"}
    assert result.meta["total_sales_sum"] == 735.0


def test_seasons_top_products(retail_df: pd.DataFrame) -> None:
    result = seasons(retail_df)
    charts = by_name(result.charts)

    assert list(charts) == [
        "top5_products_winter",
        "top5_products_spring",
        "top5_products_summer",
        "top5_products_fall",
    ]
    winter = charts["top5_products_winter"]
    assert winter["season"] == "winter"
    assert winter["type"] == "bar"
    assert winter["labels"] == ["Milk", "Bread", "Eggs", "Honey", "Soap"]
    assert winter["values"] == [6, 4, 2, 2, 2]
    assert winter["total"] == 17
    assert winter["top"] == {"label": "Milk", "count": 6, "percentage": 35.29}
    assert result.meta["seasons"] == ["Winter", "Spring", "Summer", "Fall"]
    assert result.meta["total_unique_products"] == 6


def test_retail_metrics(retail_df: pd.DataFrame) -> None:
    result = retail_metrics(retail_df)
    charts = by_name(result.charts)

    assert charts["total_sales"]["value"] == 735.0
    assert charts["total_sales"]["unit_sign"] == "$"
    assert charts["average_sale_value"]["value"] == 24.5
    assert charts["average_items_per_transaction"]["value"] == 3.0
    assert charts["total_transactions"]["value"] == 30
    assert charts["unique_customers"]["value"] == 20
    assert charts["repeat_customers"]["value"] == 10
    assert charts["best_month"]["value"] == "2024-03"
    assert charts["best_month"]["extra"] == {"sales": 255.0}
    assert "unit_sign" not in charts["best_month"]
    assert charts["monthly_sales"]["labels"] == ["2024-01", "2024-02", "2024-03"]
    assert charts["sales_by_store_type"]["labels"][0] == "Supermarket"
    assert sum(charts["sales_by_city"]["values"]) == pytest.approx(735.0)
    assert not any(name.startswith("top5_products_") for name in charts)
    assert "Month" in result.meta["data_columns"]


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("['Milk', 'Bread']", ["Milk", "Bread"]),
        ('["BBQ Sauce"]', ["BBQ Sauce"]),
        ("Milk, Eggs", ["Milk", "Eggs"]),
        ("[]", []),
    ],
)
def test_parse_products(raw: str, expected: list[str]) -> None:
    assert parse_products(raw) == expected


def test_season_slug_is_contract_safe() -> None:
    assert season_slug("Late Summer!") == "late_summer"
    assert season_slug("???") == "unknown"


@pytest.mark.parametrize("job", sorted(JOBS))
def test_every_job_yields_charts(job: str, retail_df: pd.DataFrame) -> None:
    result = JOBS[job](retail_df)
    assert result.charts
    assert isinstance(result.meta, dict)
