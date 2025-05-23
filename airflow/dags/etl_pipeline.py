import logging
import json
from datetime import datetime

from airflow import DAG
from airflow.operators.python import PythonOperator

import boto3
from botocore.client import Config

config_s3 = {
    "endpoint_url": "https://storage.yandexcloud.net",
    "key_id": "",
    "key_value": "",
    "bucket_name": "",
    "region_name": "ru-central1"
}

bucket_name = config_s3['bucket_name']
access_key = config_s3['key_id']
secret_key = config_s3['key_value']
endpoint_url = config_s3['endpoint_url']
region_name = config_s3['region_name']

def get_file_from_s3(**kwargs):
    dag_run = kwargs.get('dag_run')
    
    if not dag_run or not dag_run.conf:
        raise ValueError("dag_run or conf is missing")

    object_key = dag_run.conf.get('object_key')
    
    if not object_key:
        raise ValueError("object_key not provided in conf")

    try:
        s3 = boto3.client(
          's3',
          endpoint_url=endpoint_url,
          aws_access_key_id=access_key,
          aws_secret_access_key=secret_key,
          config=Config(signature_version='s3v4'),
          region_name=region_name
        )
      
        response = s3.get_object(Bucket=bucket_name, Key=object_key)
        content = response['Body'].read().decode('utf-8')
        data = json.loads(content)
        
        logging.info(f'Content of S3 JSON file:\n{json.dumps(data, indent=2)}')
    except Exception as e:
        logging.error(f'Error reading file from S3: {e}')
        raise

with DAG(
    dag_id='etl_pipeline',
    start_date=datetime(2025, 5, 21),
    schedule='@once',
    catchup=False,
    tags=['etl', 'remote', 's3', 'json'],
) as dag:

    print_content_task = PythonOperator(
        task_id='get-file-from-s3',
        python_callable=get_file_from_s3,
    )
