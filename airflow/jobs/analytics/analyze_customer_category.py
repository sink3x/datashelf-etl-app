import time

import pandas as pd

from utils.rabbitmq.rabbitmq_send import send_to_rabbitmq

def analyze_customer_category(**kwargs):
    ti = kwargs['ti']
    object_key = ti.xcom_pull(task_ids='download_file_from_s3', key='object_key')
    df_json = ti.xcom_pull(task_ids='load_to_pandas_dataframe', key='dataframe_json')
    df = pd.read_json(df_json)

    start_time = time.time()
    category_counts = df['Customer_Category'].value_counts().reset_index()
    category_counts.columns = ['Customer_Category', 'Count']
    end_time = time.time()

    total = int(category_counts['Count'].sum())
    top_row = category_counts.iloc[0]

    payload = {
        "filename": object_key.split('/')[-1],
        "processed_at": pd.Timestamp.now().isoformat(),
        "processing_time_sec": round(end_time - start_time, 3),
        "meta": {
            "total_categories": len(category_counts),
            "total_customers": total,
            "data_columns": ["Customer_Category", "Count"],
            "unique_labels": sorted(category_counts["Customer_Category"].unique().tolist()),
            "min_category_size": int(category_counts["Count"].min()),
            "max_category_size": int(category_counts["Count"].max()),
            "mean_category_size": round(category_counts["Count"].mean(), 2),
            "median_category_size": int(category_counts["Count"].median())
        },
        "chart": {
            "name": "customer_category_distribution_pie",
            "title": "Distribution of Customer Category",
            "description": (
                "This pie chart shows the distribution of customers "
                "across different categories such as Students, Young Adults, etc."
            ),
            "type": "pie",
            "labels": category_counts["Customer_Category"].tolist(),
            "values": category_counts["Count"].tolist(),
            "total": total,
            "top_category": {
                "label": top_row["Customer_Category"],
                "count": int(top_row["Count"]),
                "percentage": round(100 * top_row["Count"] / total, 2)
            },
            "categories_summary": [
                {
                    "label": row["Customer_Category"],
                    "count": int(row["Count"]),
                    "percentage": round(100 * row["Count"] / total, 2)
                }
                for _, row in category_counts.iterrows()
            ],
            "palette": ["#FF6384", "#36A2EB", "#FFCE56", "#2ecc71", "#9b59b6"]
        }
    }
    
    send_to_rabbitmq(payload)


