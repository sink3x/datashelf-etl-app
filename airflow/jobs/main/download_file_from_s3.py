import os
import base64

import boto3
from botocore.client import Config

from utils.load_config import load_config

APP_MODE = os.getenv('MODE', 'development')

config_global = load_config(APP_MODE)
config_s3 = config_global['services']['s3']

BUCKET_NAME = config_s3['bucket_name']
ACCESS_KEY = config_s3['key_id']
SECRET_KEY = config_s3['key_value']
ENDPOINT_URL = config_s3['endpoint_url']
REGION_NAME = config_s3['region_name']

def download_file_from_s3(**kwargs):
    dag_run = kwargs.get('dag_run')
    ti = kwargs['ti']

    if not dag_run or not dag_run.conf:
        raise ValueError("dag_run or conf is missing")

    object_key = dag_run.conf.get('object_key')
    if not object_key:
        raise ValueError("object_key not provided in conf")

    s3 = boto3.client(
        's3',
        endpoint_url=ENDPOINT_URL,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        config=Config(signature_version='s3v4'),
        region_name=REGION_NAME
    )

    response = s3.get_object(Bucket=BUCKET_NAME, Key=object_key)
    file_content_bytes = response['Body'].read()
    file_content_b64 = base64.b64encode(file_content_bytes).decode('utf-8')

    ti.xcom_push(key='file_content_b64', value=file_content_b64)
    ti.xcom_push(key='object_key', value=object_key)
