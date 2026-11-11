FROM apache/airflow:3.0.1-python3.10
COPY requirements.txt /requirements.txt
USER airflow
RUN pip install --no-cache-dir -r /requirements.txt
