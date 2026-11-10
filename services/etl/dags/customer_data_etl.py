"""Retail dataset ETL triggered by the API with `conf={"object_key": "raw-data/<file>"}`.

Only S3 keys travel through XCom; the dataset itself is staged as parquet in S3.
Imports of the ETL package happen inside tasks so DAG parsing does not need S3/RabbitMQ settings.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from airflow.sdk import TriggerRule, dag, get_current_context, task
from airflow.sdk.exceptions import AirflowFailException

DAG_ID = "customer_data_etl"
ANALYTICS_JOBS = (
    "customer_category",
    "payment_methods",
    "store_type",
    "city_wordcloud",
    "customer_category_wordcloud",
    "seasons",
    "monthly_sales",
    "city_sales_summary",
    "retail_metrics",
)

DEFAULT_ARGS: dict[str, Any] = {
    "retries": 3,
    "retry_delay": timedelta(seconds=20),
    "retry_exponential_backoff": 2.0,
    "max_retry_delay": timedelta(minutes=5),
    "execution_timeout": timedelta(minutes=15),
}


def analytics_task_id(job: str) -> str:
    return f"analyze_{job}"


@dag(
    dag_id=DAG_ID,
    schedule=None,
    start_date=datetime(2025, 5, 21),
    catchup=False,
    max_active_runs=8,
    default_args=DEFAULT_ARGS,
    tags=["etl", "s3", "rabbitmq", "retail"],
    doc_md=__doc__,
)
def customer_data_etl() -> None:
    @task
    def extract() -> dict[str, str]:
        from datashelf_etl.config import Settings
        from datashelf_etl.io.loaders import DatasetError
        from datashelf_etl.io.s3 import make_client
        from datashelf_etl.pipeline import stage_dataset

        context = get_current_context()
        conf = context["dag_run"].conf or {}
        settings = Settings()
        try:
            staged = stage_dataset(make_client(settings), settings, conf.get("object_key"), context["run_id"])
        except DatasetError as exc:
            raise AirflowFailException(str(exc)) from exc
        return staged.to_xcom()

    def make_analytics_task(job: str) -> Any:
        @task(task_id=analytics_task_id(job))
        def analyze(staged: dict[str, str]) -> dict[str, str]:
            from datashelf_etl.config import Settings
            from datashelf_etl.io.loaders import DatasetError
            from datashelf_etl.io.s3 import make_client
            from datashelf_etl.messaging.publisher import RabbitMQConnection
            from datashelf_etl.pipeline import StagedDataset, publish_job

            settings = Settings()

            def connect() -> RabbitMQConnection:
                return RabbitMQConnection(
                    settings.rabbitmq_url.get_secret_value(), settings.rabbitmq_exchange
                )

            try:
                return publish_job(
                    job,
                    make_client(settings),
                    settings,
                    StagedDataset.from_xcom(staged),
                    get_current_context()["run_id"],
                    connect,
                )
            except DatasetError as exc:
                raise AirflowFailException(str(exc)) from exc

        return analyze

    @task(trigger_rule=TriggerRule.ALL_DONE, retries=0)
    def summarize() -> list[str]:
        from datashelf_etl.pipeline import JobsFailedError
        from datashelf_etl.pipeline import summarize as summarize_results

        task_ids = [analytics_task_id(job) for job in ANALYTICS_JOBS]
        results = get_current_context()["ti"].xcom_pull(task_ids=task_ids) or []
        try:
            return summarize_results(ANALYTICS_JOBS, results)
        except JobsFailedError as exc:
            raise AirflowFailException(str(exc)) from exc

    staged = extract()
    analytics = [make_analytics_task(job)(staged) for job in ANALYTICS_JOBS]
    analytics >> summarize()


dag_object = customer_data_etl()
