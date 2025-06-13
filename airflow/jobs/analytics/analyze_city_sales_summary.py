import time
import pandas as pd

from utils.rabbitmq.rabbitmq_send import send_to_rabbitmq

def analyze_city_sales_summary(**kwargs):
    ti = kwargs['ti']
    object_key = ti.xcom_pull(task_ids='download_file_from_s3', key='object_key')
    df_json = ti.xcom_pull(task_ids='load_to_pandas_dataframe', key='dataframe_json')
    df = pd.read_json(df_json)

    start_time = time.time()

    required_columns = ['City', 'Total_Cost']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns in DataFrame: {missing_columns}. Available columns: {df.columns.tolist()}")

    grouped = df.groupby('City').agg({'Total_Cost': ['sum', 'count']}).dropna()
    grouped.columns = ['TotalSales', 'Count']
    grouped = grouped.sort_values(by='TotalSales', ascending=False)

    labels = grouped.index.tolist()
    values_sum = [float(v) for v in grouped['TotalSales'].tolist()]
    values_count = [int(v) for v in grouped['Count'].tolist()]

    total_sales = float(round(grouped['TotalSales'].sum(), 2))
    total_count = int(grouped['Count'].sum())
    top_city = labels[0] if labels else None

    end_time = time.time()

    payload = {
        "filename": object_key.split('/')[-1],
        "processed_at": pd.Timestamp.now().isoformat(),
        "processing_time_sec": float(f"{end_time - start_time}"),
        "meta": {
            "total_unique_cities": int(len(grouped)),
            "total_sales": total_sales,
            "total_entries": total_count,
            "data_columns": ["City", "TotalSales", "Count"],
            "min_sales": float(round(grouped['TotalSales'].min(), 2)) if not grouped.empty else 0,
            "max_sales": float(round(grouped['TotalSales'].max(), 2)) if not grouped.empty else 0,
            "mean_sales": float(round(grouped['TotalSales'].mean(), 2)) if not grouped.empty else 0,
            "median_sales": float(round(grouped['TotalSales'].median(), 2)) if not grouped.empty else 0,
        },
        "chart": {
            "name": "city_sales_summary",
            "title": "Total Sales and Count by City",
            "description": "Total sales amount and number of entries per city, for visualization in charts.",
            "type": "grouped",
            "labels": labels,
            "values_sum": values_sum,
            "values_count": values_count,
            "top": {
                "label": top_city,
                "total_sales": values_sum[0] if values_sum else 0,
                "count": values_count[0] if values_count else 0,
                "sales_percentage": round(100 * values_sum[0] / total_sales, 2) if total_sales > 0 else 0
            }
        }
    }

    send_to_rabbitmq(payload)
