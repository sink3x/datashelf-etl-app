"""Headline KPIs plus the breakdowns shown next to them on the dashboard."""

from __future__ import annotations

import pandas as pd

from datashelf_etl.analytics.base import AnalyticsResult
from datashelf_etl.analytics.sales import sales_by_month
from datashelf_etl.analytics.seasons import product_counts_by_season, seasons_meta
from datashelf_etl.contracts import Chart, MetricChart, SeriesChart


def _metric(name: str, title: str, description: str, value: float | str, unit_sign: str = "") -> MetricChart:
    return MetricChart(name=name, title=title, description=description, value=value, unit_sign=unit_sign)


def _sales_by(df: pd.DataFrame, column: str) -> pd.Series[float]:
    sums = df.dropna(subset=[column]).groupby(column)["Total_Cost"].sum()
    frame = sums.rename_axis("label").reset_index(name="sum")
    frame = frame.sort_values(["sum", "label"], ascending=[False, True], kind="stable")
    return pd.Series(frame["sum"].to_numpy(), index=frame["label"].astype(str).to_numpy())


def retail_metrics(df: pd.DataFrame) -> AnalyticsResult:
    by_season = product_counts_by_season(df)
    charts: list[Chart] = []

    customers = df["Customer_Name"].dropna()
    by_month = sales_by_month(df)
    by_store = _sales_by(df, "Store_Type")
    by_city = _sales_by(df, "City")

    charts.extend(
        [
            _metric(
                "total_sales",
                "Total Sales",
                "Total revenue from all sales.",
                round(float(df["Total_Cost"].sum()), 2),
                "$",
            ),
            _metric(
                "average_sale_value",
                "Average Sale Value",
                "Mean value of a single sale transaction.",
                round(float(df["Total_Cost"].mean()), 2),
                "$",
            ),
            _metric(
                "average_items_per_transaction",
                "Average Items per Transaction",
                "Mean number of items per transaction.",
                round(float(df["Total_Items"].mean()), 2),
            ),
            _metric(
                "total_transactions",
                "Total Transactions",
                "Total number of transactions recorded.",
                int(df["Transaction_ID"].nunique()),
            ),
            _metric(
                "unique_customers",
                "Unique Customers",
                "Number of distinct customers who made purchases.",
                int(customers.nunique()),
            ),
            _metric(
                "repeat_customers",
                "Repeat Customers",
                "Customers who made more than one transaction.",
                int(customers.value_counts().gt(1).sum()),
            ),
            SeriesChart.model_validate(
                {
                    "name": "sales_by_store_type",
                    "title": "Sales by Store Type",
                    "description": "Total sales aggregated by store type.",
                    "type": "bar",
                    "labels": by_store.index.tolist(),
                    "values": [round(float(value), 2) for value in by_store],
                    "unit_sign": "",
                }
            ),
            SeriesChart(
                name="sales_by_city",
                title="Sales by City",
                description="Total sales per city.",
                type="bar",
                labels=by_city.index.tolist(),
                values=[round(float(value), 2) for value in by_city],
            ),
        ]
    )

    if not by_month.empty:
        charts.append(
            MetricChart.model_validate(
                {
                    "name": "best_month",
                    "title": "Best Month for Sales",
                    "description": "The month with the highest total sales.",
                    "value": str(by_month.idxmax()),
                    "extra": {"sales": round(float(by_month.max()), 2)},
                }
            )
        )
    charts.append(
        SeriesChart(
            name="monthly_sales",
            title="Monthly Sales Trend",
            description="Total sales aggregated by month.",
            type="line",
            labels=[str(month) for month in by_month.index],
            values=[round(float(value), 2) for value in by_month],
        )
    )

    meta = {
        **seasons_meta(by_season),
        "data_columns": [*map(str, df.columns), "Month", "TotalPrice"],
    }
    return AnalyticsResult(charts=charts, meta=meta)
