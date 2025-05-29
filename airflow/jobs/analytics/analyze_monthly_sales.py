import time

import pandas as pd

from utils.rabbitmq.rabbitmq_send import send_to_rabbitmq

def analyze_monthly_sales(**kwargs):
    ti = kwargs['ti']
    object_key = ti.xcom_pull(task_ids='download_file_from_s3', key='object_key')
    df_json = ti.xcom_pull(task_ids='load_to_pandas_dataframe', key='dataframe_json')
    df = pd.read_json(df_json)

    start_time = time.time()

    df["Date"] = pd.to_datetime(df["Date"]) 
    df["Month"] = df["Date"].dt.to_period("M").dt.to_timestamp()
    monthly_sales = df.groupby("Month")["Total_Cost"].sum().reset_index()

    end_time = time.time()

    payload = {
        "filename": object_key.split('/')[-1],
        "processed_at": pd.Timestamp.now().isoformat(),
        "processing_time_sec": float(f"{end_time - start_time}"),
        "meta": {
            "total_months": len(monthly_sales),
            "total_sales_sum": float(monthly_sales["Total_Cost"].sum()),
            "data_columns": ["Month", "Total_Cost"],
            "date_range": {
                "start": monthly_sales["Month"].min().isoformat(),
                "end": monthly_sales["Month"].max().isoformat(),
            }
        },
        "chart": {
            "name": "total_sales_by_month",
            "title": "Total Sales by Month",
            "description": "Line chart showing total sales aggregated by month.",
            "type": "line",
            "labels": monthly_sales["Month"].dt.strftime("%Y-%m").tolist(),
            "values": monthly_sales["Total_Cost"].round(2).tolist()
        }
    }

    send_to_rabbitmq(payload)