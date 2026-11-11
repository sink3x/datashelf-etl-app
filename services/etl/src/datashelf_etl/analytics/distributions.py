"""Categorical distributions rendered as pie charts and word clouds."""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from datashelf_etl.analytics.base import AnalyticsResult, count_stats, counts_desc, percentage
from datashelf_etl.contracts import FrequencyChart, Number, SeriesChart, Top


@dataclass(frozen=True)
class _PieSpec:
    column: str
    name: str
    title: str
    description: str
    summary_key: str
    palette: tuple[str, ...]
    total_groups_key: str
    total_items_key: str
    stat_key: str


def _pie(df: pd.DataFrame, spec: _PieSpec) -> AnalyticsResult:
    counts = counts_desc(df[spec.column])
    labels = [str(label) for label in counts.index]
    values = [int(value) for value in counts]
    total = sum(values)
    stats = count_stats(counts)
    summary = [
        {"label": label, "count": value, "percentage": percentage(value, total)}
        for label, value in zip(labels, values, strict=True)
    ]
    chart = SeriesChart.model_validate(
        {
            "name": spec.name,
            "title": spec.title,
            "description": spec.description,
            "type": "pie",
            "labels": labels,
            "values": values,
            "total": total,
            "top": summary[0] if summary else {"label": None, "count": 0, "percentage": 0},
            spec.summary_key: summary,
            "palette": list(spec.palette),
        }
    )
    meta = {
        spec.total_groups_key: len(labels),
        spec.total_items_key: total,
        "data_columns": [spec.column, "Count"],
        "unique_labels": sorted(labels),
        **{f"{stat}_{spec.stat_key}": value for stat, value in stats.items()},
    }
    return AnalyticsResult(charts=[chart], meta=meta)


def _frequency(
    df: pd.DataFrame,
    column: str,
    *,
    name: str,
    title: str,
    description: str,
    total_groups_key: str,
    total_items_key: str,
    unique_key: str,
    stat_key: str,
) -> AnalyticsResult:
    counts = counts_desc(df[column])
    labels = [str(label) for label in counts.index]
    values: list[Number] = [int(value) for value in counts]
    total = sum(values)
    top_count = values[0] if values else None
    chart = FrequencyChart(
        name=name,
        title=title,
        description=description,
        labels=labels,
        values=values,
        total=total,
        top=Top.model_validate(
            {
                "label": labels[0] if labels else None,
                "count": top_count,
                "percentage": percentage(top_count or 0, total),
            }
        ),
    )
    meta = {
        total_groups_key: len(labels),
        total_items_key: total,
        "data_columns": [column, "Count"],
        unique_key: sorted(labels),
        **{f"{stat}_{stat_key}": value for stat, value in count_stats(counts).items()},
    }
    return AnalyticsResult(charts=[chart], meta=meta)


def customer_category(df: pd.DataFrame) -> AnalyticsResult:
    return _pie(
        df,
        _PieSpec(
            column="Customer_Category",
            name="customer_category_distribution_pie",
            title="Distribution of Customer Category",
            description=(
                "This pie chart shows the distribution of customers "
                "across different categories such as Students, Young Adults, etc."
            ),
            summary_key="categories_summary",
            palette=("#FF6384", "#36A2EB", "#FFCE56", "#2ecc71", "#9b59b6"),
            total_groups_key="total_categories",
            total_items_key="total_customers",
            stat_key="category_size",
        ),
    )


def payment_methods(df: pd.DataFrame) -> AnalyticsResult:
    return _pie(
        df,
        _PieSpec(
            column="Payment_Method",
            name="payment_method_distribution_pie",
            title="Distribution of Payment Methods",
            description=(
                "This pie chart displays the share of different payment methods used "
                "in transactions such as cash, card, etc."
            ),
            summary_key="payment_methods_summary",
            palette=("#e74c3c", "#3498db", "#2ecc71", "#f1c40f"),
            total_groups_key="total_payment_methods",
            total_items_key="total_payments",
            stat_key="payment_count",
        ),
    )


def store_type(df: pd.DataFrame) -> AnalyticsResult:
    return _pie(
        df,
        _PieSpec(
            column="Store_Type",
            name="store_type_distribution_pie",
            title="Distribution of Store Types",
            description=(
                "This pie chart illustrates the distribution of store types like retail, wholesale, etc."
            ),
            summary_key="store_types_summary",
            palette=("#8e44ad", "#27ae60", "#2980b9", "#d35400"),
            total_groups_key="total_store_types",
            total_items_key="total_stores",
            stat_key="store_size",
        ),
    )


def city_wordcloud(df: pd.DataFrame) -> AnalyticsResult:
    return _frequency(
        df,
        "City",
        name="city_wordcloud_data",
        title="City Frequency Distribution",
        description=(
            "Frequency distribution of cities in the dataset, for visualization as a word cloud or bar chart."
        ),
        total_groups_key="total_unique_cities",
        total_items_key="total_city_entries",
        unique_key="unique_cities",
        stat_key="city_count",
    )


def customer_category_wordcloud(df: pd.DataFrame) -> AnalyticsResult:
    return _frequency(
        df,
        "Customer_Category",
        name="customer_category_wordcloud_data",
        title="Customer Category Frequency Distribution",
        description=(
            "Frequency distribution of customer categories for visualization as a word cloud or bar chart."
        ),
        total_groups_key="total_unique_categories",
        total_items_key="total_entries",
        unique_key="unique_categories",
        stat_key="category_count",
    )
