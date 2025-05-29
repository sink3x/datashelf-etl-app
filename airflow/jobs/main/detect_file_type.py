import os

def detect_file_type(**kwargs):
    ti = kwargs['ti']
    object_key = ti.xcom_pull(task_ids='download_file_from_s3', key='object_key')
    ext = os.path.splitext(object_key)[1].lower()

    if ext == '.json':
        file_type = 'json'
    elif ext == '.csv':
        file_type = 'csv'
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    ti.xcom_push(key='file_type', value=file_type)
