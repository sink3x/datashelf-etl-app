import time

import pandas as pd

from utils.rabbitmq.rabbitmq_send import send_to_rabbitmq

def analyze_city_wordcloud(**kwargs):
    ti = kwargs['ti']
    object_key = ti.xcom_pull(task_ids='download_file_from_s3', key='object_key')
    df_json = ti.xcom_pull(task_ids='load_to_pandas_dataframe', key='dataframe_json')
    df = pd.read_json(df_json)

    start_time = time.time()

    city_counts = df['City'].dropna().value_counts()
    labels = city_counts.index.tolist()
    values = city_counts.values.tolist()
    total = sum(values)
    top_label = labels[0] if labels else None
    top_value = values[0] if values else None

    end_time = time.time()

    payload = {
        "filename": object_key.split('/')[-1],
        "processed_at": pd.Timestamp.now().isoformat(),
        "processing_time_sec": float(f"{end_time - start_time}"),
        "meta": {
            "total_unique_cities": len(city_counts),
            "total_city_entries": total,
            "data_columns": ["City", "Count"],
            "unique_cities": sorted(labels),
            "min_city_count": int(city_counts.min()) if not city_counts.empty else 0,
            "max_city_count": int(city_counts.max()) if not city_counts.empty else 0,
            "mean_city_count": round(city_counts.mean(), 2) if not city_counts.empty else 0,
            "median_city_count": int(city_counts.median()) if not city_counts.empty else 0
        },
        "chart": {
            "name": "city_wordcloud_data",
            "title": "City Frequency Distribution",
            "description": "Frequency distribution of cities in the dataset, for visualization as a word cloud or bar chart.",
            "type": "frequency",
            "labels": labels,
            "values": values,
            "total": total,
            "top_city": {
                "label": top_label,
                "count": top_value,
                "percentage": round(100 * top_value / total, 2) if total > 0 else 0
            }
        }
    }
    
    send_to_rabbitmq(payload)