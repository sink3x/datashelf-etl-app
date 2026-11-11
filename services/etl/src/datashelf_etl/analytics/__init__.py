"""Pure analytics: each job maps a normalized retail DataFrame to charts plus meta."""

from __future__ import annotations

from types import MappingProxyType

from datashelf_etl.analytics.base import Analysis, AnalyticsResult
from datashelf_etl.analytics.distributions import (
    city_wordcloud,
    customer_category,
    customer_category_wordcloud,
    payment_methods,
    store_type,
)
from datashelf_etl.analytics.retail_metrics import retail_metrics
from datashelf_etl.analytics.sales import city_sales_summary, monthly_sales
from datashelf_etl.analytics.seasons import seasons

JOBS: MappingProxyType[str, Analysis] = MappingProxyType(
    {
        "customer_category": customer_category,
        "payment_methods": payment_methods,
        "store_type": store_type,
        "city_wordcloud": city_wordcloud,
        "customer_category_wordcloud": customer_category_wordcloud,
        "seasons": seasons,
        "monthly_sales": monthly_sales,
        "city_sales_summary": city_sales_summary,
        "retail_metrics": retail_metrics,
    }
)

__all__ = ["JOBS", "Analysis", "AnalyticsResult"]
