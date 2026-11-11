from __future__ import annotations

import ast
import importlib.util
from pathlib import Path

import pytest

from datashelf_etl.analytics import JOBS

DAG_FILE = Path(__file__).resolve().parents[1] / "dags" / "customer_data_etl.py"


def test_dag_jobs_match_registry() -> None:
    """The DAG keeps its own job list to avoid importing pandas at parse time; it must not drift."""
    tree = ast.parse(DAG_FILE.read_text())
    [jobs] = [
        ast.literal_eval(node.value)
        for node in tree.body
        if isinstance(node, ast.Assign)
        and any(isinstance(target, ast.Name) and target.id == "ANALYTICS_JOBS" for target in node.targets)
    ]
    assert sorted(jobs) == sorted(JOBS)


def test_dag_structure() -> None:
    pytest.importorskip("airflow.sdk", reason="apache-airflow is provided by the runtime image")
    spec = importlib.util.spec_from_file_location("customer_data_etl", DAG_FILE)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    from airflow.sdk import DAG

    dag = module.dag_object
    assert isinstance(dag, DAG)
    assert dag.dag_id == "customer_data_etl"
    summarize = dag.get_task("summarize")
    assert summarize.trigger_rule == "all_done"
    assert {f"analyze_{job}" for job in JOBS} == set(summarize.upstream_task_ids)
    assert dag.get_task("extract").downstream_task_ids == {f"analyze_{job}" for job in JOBS}
