# syntax=docker/dockerfile:1
ARG AIRFLOW_VERSION=3.3.2
ARG PYTHON_VERSION=3.12

FROM apache/airflow:${AIRFLOW_VERSION}-python${PYTHON_VERSION}

ARG AIRFLOW_VERSION
ARG PYTHON_VERSION

USER airflow

# Install the ETL package next to the image's Airflow, pinning Airflow itself and honouring the official
# constraints so pip never upgrades or downgrades what the image ships with.
COPY --chown=airflow:0 pyproject.toml /opt/datashelf-etl/pyproject.toml
COPY --chown=airflow:0 src /opt/datashelf-etl/src
RUN pip install --no-cache-dir \
        "apache-airflow==${AIRFLOW_VERSION}" \
        /opt/datashelf-etl \
        --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

COPY --chown=airflow:0 dags /opt/airflow/dags
