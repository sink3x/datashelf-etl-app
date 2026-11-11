import time

import pandas as pd

from utils.rabbitmq.rabbitmq_send import send_to_rabbitmq

def analyze_store_type(**kwargs):
    ti = kwargs['ti']
    object_key = ti.xcom_pull(task_ids='download_file_from_s3', key='object_key')
    df_json = ti.xcom_pull(task_ids='load_to_pandas_dataframe', key='dataframe_json')
    df = pd.read_json(df_json)

    start_time = time.time()
    store_counts = df['Store_Type'].value_counts().reset_index()
    store_counts.columns = ['Store_Type', 'Count']
    end_time = time.time()

    total = int(store_counts['Count'].sum())
    top_row = store_counts.iloc[0]

    payload = {
        "filename": object_key.split('/')[-1],
        "processed_at": pd.Timestamp.now().isoformat(),
        "processing_time_sec": round(end_time - start_time, 3),
        "meta": {
            "total_store_types": len(store_counts),
            "total_stores": total,
            "data_columns": ["Store_Type", "Count"],
            "unique_labels": sorted(store_counts["Store_Type"].unique().tolist()),
            "min_store_size": int(store_counts["Count"].min()),
            "max_store_size": int(store_counts["Count"].max()),
            "mean_store_size": round(store_counts["Count"].mean(), 2),
            "median_store_size": int(store_counts["Count"].median())
        },
        "chart": {
            "name": "store_type_distribution_pie",
            "title": "Distribution of Store Types",
            "description": (
                "This pie chart illustrates the distribution of store types "
                "like retail, wholesale, etc."
            ),
            "type": "pie",
            "labels": store_counts["Store_Type"].tolist(),
            "values": store_counts["Count"].tolist(),
            "total": total,
            "top": {
                "label": top_row["Store_Type"],
                "count": int(top_row["Count"]),
                "percentage": round(100 * top_row["Count"] / total, 2)
            },
            "store_types_summary": [
                {
                    "label": row["Store_Type"],
                    "count": int(row["Count"]),
                    "percentage": round(100 * row["Count"] / total, 2)
                }
                for _, row in store_counts.iterrows()
            ],
            "palette": ["#8e44ad", "#27ae60", "#2980b9", "#d35400"]
        }
    }
    
    send_to_rabbitmq(payload)