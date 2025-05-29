import time

import pandas as pd

from utils.rabbitmq.rabbitmq_send import send_to_rabbitmq

def analyze_payment_methods(**kwargs):
    ti = kwargs['ti']
    object_key = ti.xcom_pull(task_ids='download_file_from_s3', key='object_key')
    df_json = ti.xcom_pull(task_ids='load_to_pandas_dataframe', key='dataframe_json')
    df = pd.read_json(df_json)

    start_time = time.time()
    payment_counts = df['Payment_Method'].value_counts().reset_index()
    payment_counts.columns = ['Payment_Method', 'Count']
    end_time = time.time()

    total = int(payment_counts['Count'].sum())
    top_row = payment_counts.iloc[0]

    payload = {
        "filename": object_key.split('/')[-1],
        "processed_at": pd.Timestamp.now().isoformat(),
        "processing_time_sec": round(end_time - start_time, 3),
        "meta": {
            "total_payment_methods": len(payment_counts),
            "total_payments": total,
            "data_columns": ["Payment_Method", "Count"],
            "unique_labels": sorted(payment_counts["Payment_Method"].unique().tolist()),
            "min_payment_count": int(payment_counts["Count"].min()),
            "max_payment_count": int(payment_counts["Count"].max()),
            "mean_payment_count": round(payment_counts["Count"].mean(), 2),
            "median_payment_count": int(payment_counts["Count"].median())
        },
        "chart": {
            "name": "payment_method_distribution_pie",
            "title": "Distribution of Payment Methods",
            "description": (
                "This pie chart displays the share of different payment methods used "
                "in transactions such as cash, card, etc."
            ),
            "type": "pie",
            "labels": payment_counts["Payment_Method"].tolist(),
            "values": payment_counts["Count"].tolist(),
            "total": total,
            "top_payment_method": {
                "label": top_row["Payment_Method"],
                "count": int(top_row["Count"]),
                "percentage": round(100 * top_row["Count"] / total, 2)
            },
            "payment_methods_summary": [
                {
                    "label": row["Payment_Method"],
                    "count": int(row["Count"]),
                    "percentage": round(100 * row["Count"] / total, 2)
                }
                for _, row in payment_counts.iterrows()
            ],
            "palette": ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f"]
        }
    }
    
    send_to_rabbitmq(payload)
