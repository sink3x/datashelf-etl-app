import logging
import base64
import io
import os
import json
from datetime import datetime

import pandas as pd
from airflow import DAG
from airflow.operators.python import PythonOperator

import boto3
from botocore.client import Config

import pika

APP_MODE = os.getenv('MODE', 'development')
CONFIG_LOCAL_URL = os.path.join(os.path.dirname(__file__), '../configs', 'app.local.json')

def load_config(mode: str):
    match mode:
        case 'production':
            raise NotImplementedError("Production config not implemented")
        case 'development':
          with open(CONFIG_LOCAL_URL) as file:
            return json.load(file)
            
    return None
  
config_global = load_config(APP_MODE)
config_s3 = config_global['services']['s3']

bucket_name = config_s3['bucket_name']
access_key = config_s3['key_id']
secret_key = config_s3['key_value']
endpoint_url = config_s3['endpoint_url']
region_name = config_s3['region_name']

config_rabbitmq = config_global['services']['rabbitmq']

def download_file_from_s3(**kwargs):
    dag_run = kwargs.get('dag_run')
    
    if not dag_run or not dag_run.conf:
        raise ValueError("dag_run or conf is missing")

    object_key = dag_run.conf.get('object_key')
    
    if not object_key:
        raise ValueError("object_key not provided in conf")

    s3 = boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version='s3v4'),
        region_name=region_name
    )

    response = s3.get_object(Bucket=bucket_name, Key=object_key)
    
    logging.info(f"File {object_key} downloaded, response {response['Body']}")      
    
    file_content_bytes = response['Body'].read()
    file_content_b64 = base64.b64encode(file_content_bytes).decode('utf-8')

    logging.info(f"File {object_key} downloaded, size: {len(file_content_bytes)} bytes")

    kwargs['ti'].xcom_push(key='file_content_b64', value=file_content_b64)
    kwargs['ti'].xcom_push(key='object_key', value=object_key)


def determine_file_type(**kwargs):
    ti = kwargs['ti']
    object_key = ti.xcom_pull(task_ids='download_file_from_s3', key='object_key')
    
    if not object_key:
        raise ValueError("object_key not found in XCom")

    ext = os.path.splitext(object_key)[1].lower()
    
    if ext == '.json':
        file_type = 'json'
    elif ext == '.csv':
        file_type = 'csv'
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    logging.info(f"Detected file type: {file_type} for file {object_key}")
    
    ti.xcom_push(key='file_type', value=file_type)


def load_to_dataframe(**kwargs):
    ti = kwargs['ti']
    file_type = ti.xcom_pull(task_ids='detect_file_type', key='file_type')
    file_content_b64 = ti.xcom_pull(task_ids='download_file_from_s3', key='file_content_b64')

    if not file_type or not file_content_b64:
        raise ValueError("file_type or file_content_b64 not found in XCom")

    file_content_bytes = base64.b64decode(file_content_b64)
    file_stream = io.BytesIO(file_content_bytes)

    if file_type == 'json':
        raw_json_str = file_content_bytes.decode('utf-8')
        
        logging.info(f"Raw JSON content: {raw_json_str}")

        parsed_json = json.loads(raw_json_str)
        
        logging.info(f"Parsed JSON type: {type(parsed_json)}")

        if isinstance(parsed_json, dict):
            df = pd.DataFrame([parsed_json])
        else:
            df = pd.read_json(file_stream, encoding='utf-8')

    elif file_type == 'csv':
        df = pd.read_csv(file_stream, encoding='utf-8')
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

    logging.info(f"DataFrame loaded with shape: {df.shape}")
    logging.info(f"DataFrame head:\n{df.head()}")

    df_json = df.to_json(orient='records')
    ti.xcom_push(key='dataframe_json', value=df_json)

def send_to_rabbitmq(**kwargs):
    ti = kwargs['ti']
    df_json = ti.xcom_pull(task_ids='load_to_pandas_dataframe', key='dataframe_json')
    if not df_json:
        raise ValueError("No dataframe_json found in XCom")

    rabbitmq_url = config_rabbitmq['url']
    queue_name = config_rabbitmq['queue']

    connection_params = pika.URLParameters(rabbitmq_url)
    connection = pika.BlockingConnection(connection_params)
    channel = connection.channel()

    channel.queue_declare(queue=queue_name, durable=True)
    channel.basic_publish(
        exchange='',
        routing_key=queue_name,
        body=df_json.encode('utf-8'),
        properties=pika.BasicProperties(delivery_mode=2)  # make message persistent
    )

    logging.info(f"Data sent to RabbitMQ queue '{queue_name}'")
    connection.close()

with DAG(
    dag_id='etl_pipeline',
    start_date=datetime(2025, 5, 21),
    schedule='@once',
    catchup=False,
    tags=['etl', 'remote', 's3', 'rabbitmq'],
) as dag:

    download_task = PythonOperator(
        task_id='download_file_from_s3',
        python_callable=download_file_from_s3,
    )

    detect_type_task = PythonOperator(
        task_id='detect_file_type',
        python_callable=determine_file_type,
    )

    pandas_load_task = PythonOperator(
        task_id='load_to_pandas_dataframe',
        python_callable=load_to_dataframe,
    )

    rabbitmq_send_task = PythonOperator(
        task_id='send_to_rabbitmq',
        python_callable=send_to_rabbitmq,
    )


    download_task >> detect_type_task >> pandas_load_task >> rabbitmq_send_task