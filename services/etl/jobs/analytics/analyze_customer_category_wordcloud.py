import time

import pandas as pd

from utils.rabbitmq.rabbitmq_send import send_to_rabbitmq

def analyze_customer_category_wordcloud(**kwargs):
    ti = kwargs['ti']
    object_key = ti.xcom_pull(task_ids='download_file_from_s3', key='object_key')
    df_json = ti.xcom_pull(task_ids='load_to_pandas_dataframe', key='dataframe_json')
    df = pd.read_json(df_json)

    start_time = time.time()

    category_counts = df['Customer_Category'].dropna().value_counts()
    labels = category_counts.index.tolist()
    values = category_counts.values.tolist()
    total = sum(values)
    top_label = labels[0] if labels else None
    top_value = values[0] if values else None

    end_time = time.time()

    payload = {
        "filename": object_key.split('/')[-1],
        "processed_at": pd.Timestamp.now().isoformat(),
        "processing_time_sec": float(f"{end_time - start_time}"),
        "meta": {
            "total_unique_categories": len(category_counts),
            "total_entries": total,
            "data_columns": ["Customer_Category", "Count"],
            "unique_categories": sorted(labels),
            "min_category_count": int(category_counts.min()) if not category_counts.empty else 0,
            "max_category_count": int(category_counts.max()) if not category_counts.empty else 0,
            "mean_category_count": round(category_counts.mean(), 2) if not category_counts.empty else 0,
            "median_category_count": int(category_counts.median()) if not category_counts.empty else 0
        },
        "chart": {
            "name": "customer_category_wordcloud_data",
            "title": "Customer Category Frequency Distribution",
            "description": "Frequency distribution of customer categories for visualization as a word cloud or bar chart.",
            "type": "frequency",
            "labels": labels,
            "values": values,
            "total": total,
            "top": {
                "label": top_label,
                "count": top_value,
                "percentage": round(100 * top_value / total, 2) if total > 0 else 0
            }
        }
    }

    send_to_rabbitmq(payload)