import time

import pandas as pd

from utils.rabbitmq.rabbitmq_send import send_to_rabbitmq

def analyze_seasons(**kwargs):
    
    ti = kwargs['ti']
    object_key = ti.xcom_pull(task_ids='download_file_from_s3', key='object_key')
    df_json = ti.xcom_pull(task_ids='load_to_pandas_dataframe', key='dataframe_json')
    df = pd.read_json(df_json)

    start_time = time.time()

    def converter(input_element):
        return input_element.replace('[','').replace(']','').replace("'","")

    seasons = df['Season'].unique()
    newdfs = df[['Product','Season']].groupby('Season')

    dfs = []
    for i in seasons:
        dfs.append((i, newdfs.get_group(i)['Product'].apply(converter)))

    def productcount(season, df_products):
        counts = {}
        for products_str in df_products:
            for product in products_str.split(','):
                p = product.strip()
                counts[p] = counts.get(p, 0) + 1
        return season, counts

    answer = [productcount(dfs[i][0], dfs[i][1]) for i in range(len(dfs))]

    charts = []
    for season, counts in answer:
        sorted_items = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        top5 = sorted_items[:5]
        products, counts_vals = zip(*top5) if top5 else ([], [])
        total = sum(counts.values())
        top_label, top_count = sorted_items[0] if sorted_items else (None, 0)

        charts.append({
            "season": season.lower(),
            "name": f"top5_products_{season.lower()}",
            "title": f"Top 5 Products in {season}",
            "description": f"Top 5 most frequent products sold in the {season} season.",
            "type": "bar",
            "labels": list(products),
            "values": list(counts_vals),
            "total": total,
            "top_product": {
                "label": top_label,
                "count": top_count,
                "percentage": round(100 * top_count / total, 2) if total > 0 else 0
            }
        })

    end_time = time.time()

    payload = {
        "filename": object_key.split('/')[-1],
        "processed_at": pd.Timestamp.now().isoformat(),
        "processing_time_sec": float(f"{end_time - start_time}"),
        "meta": {
            "seasons": seasons.tolist(),
            "total_seasons": len(seasons),
            "total_unique_products": len(set().union(*[list(c[1].keys()) for c in answer])),
            "data_columns": ["Product", "Count"]
        },
        "chart": charts
    }

    send_to_rabbitmq(payload)