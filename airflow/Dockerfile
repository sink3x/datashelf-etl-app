FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    make \
    curl \
    tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /airflow

COPY requirements.txt /airflow/
COPY .env /airflow/
COPY Makefile /airflow/

RUN pip install uv
RUN python3 -m venv .venv

COPY . /airflow/

ENV AIRFLOW_HOME=/airflow
ENV AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=sqlite:////airflow/airflow.db
ENV AIRFLOW__CORE__DAGS_FOLDER=/airflow/dags
ENV AIRFLOW__CORE__PLUGINS_FOLDER=/airflow/plugins
ENV AIRFLOW__LOGGING__BASE_LOG_FOLDER=/airflow/logs

RUN make install
RUN make init-db
RUN make create-user

ENTRYPOINT ["/usr/bin/tini", "--"]
EXPOSE 8080
CMD ["bash", "-c", "make scheduler & make webserver"]
