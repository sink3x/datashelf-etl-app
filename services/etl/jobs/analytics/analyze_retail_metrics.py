import time
import pandas as pd
from io import StringIO
from utils.rabbitmq.rabbitmq_send import send_to_rabbitmq

def converter(input_element):
    return input_element.replace('[','').replace(']','').replace("'", "")

def productcount(season, df_products):
    counts = {}
    for products_str in df_products:
        for product in products_str.split(','):
            p = product.strip()
            counts[p] = counts.get(p, 0) + 1
    return season, counts

def analyze_retail_metrics(**kwargs):
    ti = kwargs['ti']
    object_key = ti.xcom_pull(task_ids='download_file_from_s3', key='object_key')
    df_json = ti.xcom_pull(task_ids='load_to_pandas_dataframe', key='dataframe_json')
    df = pd.read_json(StringIO(df_json))

    start_time = time.time()

    # Подготовка данных
    df['Date'] = pd.to_datetime(df['Date'])
    df['Month'] = df['Date'].dt.to_period('M').astype(str)
    df['TotalPrice'] = df['Total_Cost']

    # Top 5 товаров по сезонам
    seasons = df['Season'].unique()
    newdfs = df[['Product', 'Season']].groupby('Season')
    dfs = [(season, newdfs.get_group(season)['Product'].apply(converter)) for season in seasons]
    season_answers = [productcount(season, products) for season, products in dfs]

    charts = []
    for season, counts in season_answers:
        sorted_items = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        top5 = sorted_items[:5]
        products, counts_vals = zip(*top5) if top5 else ([], [])
        total = sum(counts.values())
        top_label, top_count = sorted_items[0] if sorted_items else (None, 0)

        charts.append({
            "name": f"top5_products_{season.lower()}",
            "title": f"Top 5 Products in {season}",
            "description": f"Top 5 most frequent products sold in the {season} season.",
            "type": "bar",
            "labels": list(products),
            "values": list(counts_vals),
            "total": total,
            "top": {
                "label": top_label,
                "count": top_count,
                "percentage": round(100 * top_count / total, 2) if total > 0 else 0
            }
        })

    # Метрики
    sales_by_month = df.groupby('Month')['TotalPrice'].sum().sort_index()
    best_month = sales_by_month.idxmax()
    best_month_value = sales_by_month.max()

    charts.extend([
        {
            "name": "total_sales",
            "title": "Total Sales",
            "description": "Total revenue from all sales.",
            "type": "metric",
            "value": round(df['TotalPrice'].sum(), 2),
            "unit_sign": "$"
        },
        {
            "name": "average_sale_value",
            "title": "Average Sale Value",
            "description": "Mean value of a single sale transaction.",
            "type": "metric",
            "value": round(df['TotalPrice'].mean(), 2),
            "unit_sign": "$"
        },
        {
            "name": "average_items_per_transaction",
            "title": "Average Items per Transaction",
            "description": "Mean number of items per transaction.",
            "type": "metric",
            "value": round(df['Total_Items'].mean(), 2),
            "unit_sign": ""
        },
        {
            "name": "total_transactions",
            "title": "Total Transactions",
            "description": "Total number of transactions recorded.",
            "type": "metric",
            "value": int(df['Transaction_ID'].nunique()),
            "unit_sign": ""
        },
        {
            "name": "unique_customers",
            "title": "Unique Customers",
            "description": "Number of distinct customers who made purchases.",
            "type": "metric",
            "value": int(df['Customer_Name'].nunique()),
            "unit_sign": ""
        },
        {
            "name": "repeat_customers",
            "title": "Repeat Customers",
            "description": "Customers who made more than one transaction.",
            "type": "metric",
            "value": int(df['Customer_Name'].value_counts().gt(1).sum()),
            "unit_sign": ""
        },
        {
            "name": "sales_by_store_type",
            "title": "Sales by Store Type",
            "description": "Total sales aggregated by store type.",
            "type": "bar",
            "labels": df.groupby('Store_Type')['TotalPrice'].sum().sort_values(ascending=False).index.tolist(),
            "values": df.groupby('Store_Type')['TotalPrice'].sum().sort_values(ascending=False).round(2).tolist(),
            "unit_sign": ""
        },
        {
            "name": "sales_by_city",
            "title": "Sales by City",
            "description": "Total sales per city.",
            "type": "bar",
            "labels": df.groupby('City')['TotalPrice'].sum().sort_values(ascending=False).index.tolist(),
            "values": df.groupby('City')['TotalPrice'].sum().sort_values(ascending=False).round(2).tolist()
        },
        {
            "name": "best_month",
            "title": "Best Month for Sales",
            "description": "The month with the highest total sales.",
            "type": "metric",
            "value": best_month,
            "extra": {
                "sales": round(best_month_value, 2)
            }
        },
        {
            "name": "monthly_sales",
            "title": "Monthly Sales Trend",
            "description": "Total sales aggregated by month.",
            "type": "line",
            "labels": sales_by_month.index.tolist(),
            "values": sales_by_month.values.round(2).tolist()
        }
    ])

    end_time = time.time()

    payload = {
        "filename": object_key.split('/')[-1],
        "processed_at": pd.Timestamp.now().isoformat(),
        "processing_time_sec": round(end_time - start_time, 2),
        "meta": {
            "seasons": seasons.tolist(),
            "total_seasons": len(seasons),
            "total_unique_products": len(set().union(*[list(c[1].keys()) for c in season_answers])),
            "data_columns": df.columns.tolist()
        },
        "chart": charts
    }

    send_to_rabbitmq(payload)
