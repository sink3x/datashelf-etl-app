"""Revenue aggregations by city and by month."""

from __future__ import annotations

import pandas as pd

from datashelf_etl.analytics.base import AnalyticsResult, percentage
from datashelf_etl.contracts import GroupedChart, Number, SeriesChart, Top


def sales_by_month(df: pd.DataFrame) -> pd.Series[float]:
    """Total cost per calendar month, indexed by `YYYY-MM` and sorted chronologically."""
    dated = df.dropna(subset=["Date"])
    months = dated["Date"].dt.to_period("M").dt.strftime("%Y-%m")
    return dated.groupby(months)["Total_Cost"].sum().sort_index()


def city_sales_summary(df: pd.DataFrame) -> AnalyticsResult:
    grouped = df.dropna(subset=["City"]).groupby("City")["Total_Cost"].agg(["sum", "count"])
    grouped = grouped.sort_values(["sum", "count"], ascending=False, kind="stable")

    labels = [str(city) for city in grouped.index]
    values_sum = [float(value) for value in grouped["sum"]]
    values_count: list[Number] = [int(value) for value in grouped["count"]]
    total_sales = round(float(grouped["sum"].sum()), 2)

    def stat(value: float) -> float:
        return round(float(value), 2) if not grouped.empty else 0

    chart = GroupedChart(
        name="city_sales_summary",
        title="Total Sales and Count by City",
        description="Total sales amount and number of entries per city, for visualization in charts.",
        labels=labels,
        values_sum=values_sum,
        values_count=values_count,
        top=Top.model_validate(
            {
                "label": labels[0] if labels else None,
                "total_sales": values_sum[0] if values_sum else 0,
                "count": values_count[0] if values_count else 0,
                "sales_percentage": percentage(values_sum[0], total_sales) if values_sum else 0,
            }
        ),
    )
    meta = {
        "total_unique_cities": len(labels),
        "total_sales": total_sales,
        "total_entries": sum(values_count),
        "data_columns": ["City", "TotalSales", "Count"],
        "min_sales": stat(grouped["sum"].min()),
        "max_sales": stat(grouped["sum"].max()),
        "mean_sales": stat(grouped["sum"].mean()),
        "median_sales": stat(grouped["sum"].median()),
    }
    return AnalyticsResult(charts=[chart], meta=meta)


def monthly_sales(df: pd.DataFrame) -> AnalyticsResult:
    by_month = sales_by_month(df)
    labels = [str(month) for month in by_month.index]
    chart = SeriesChart(
        name="total_sales_by_month",
        title="Total Sales by Month",
        description="Line chart showing total sales aggregated by month.",
        type="line",
        labels=labels,
        values=[round(float(value), 2) for value in by_month],
    )
    meta = {
        "total_months": len(labels),
        "total_sales_sum": round(float(by_month.sum()), 2),
        "data_columns": ["Month", "Total_Cost"],
        "date_range": {
            "start": f"{labels[0]}-01T00:00:00" if labels else None,
            "end": f"{labels[-1]}-01T00:00:00" if labels else None,
        },
    }
    return AnalyticsResult(charts=[chart], meta=meta)
