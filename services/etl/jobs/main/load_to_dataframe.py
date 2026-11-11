import base64
import io
import json

import pandas as pd

def load_to_dataframe(**kwargs):
    ti = kwargs['ti']
    file_type = ti.xcom_pull(task_ids='detect_file_type', key='file_type')
    file_content_b64 = ti.xcom_pull(task_ids='download_file_from_s3', key='file_content_b64')

    file_content_bytes = base64.b64decode(file_content_b64)
    file_stream = io.BytesIO(file_content_bytes)

    if file_type == 'json':
        raw_json_str = file_content_bytes.decode('utf-8')
        parsed_json = json.loads(raw_json_str)
        df = pd.DataFrame([parsed_json]) if isinstance(parsed_json, dict) else pd.read_json(file_stream)
    elif file_type == 'csv':
        df = pd.read_csv(file_stream)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

    ti.xcom_push(key='dataframe_json', value=df.to_json(orient='records'))
