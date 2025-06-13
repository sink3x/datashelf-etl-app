import sys
import os
from datetime import datetime

from airflow import DAG
from airflow.operators.python import PythonOperator

ROOT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

if ROOT_PATH not in sys.path:
    sys.path.insert(0, ROOT_PATH)

from jobs.main.load_to_dataframe import load_to_dataframe
from jobs.main.download_file_from_s3 import download_file_from_s3
from jobs.main.detect_file_type import detect_file_type

from jobs.analytics.analyze_city_wordcloud import analyze_city_wordcloud
from jobs.analytics.analyze_seasons import analyze_seasons
from jobs.analytics.analyze_customer_category_wordcloud import analyze_customer_category_wordcloud
from jobs.analytics.analyze_store_type import analyze_store_type
from jobs.analytics.analyze_payment_methods import analyze_payment_methods
from jobs.analytics.analyze_customer_category import analyze_customer_category
from jobs.analytics.analyze_monthly_sales import analyze_monthly_sales
from jobs.analytics.analyze_city_sales_summary import analyze_city_sales_summary
from jobs.analytics.analyze_retail_metrics import analyze_retail_metrics

DAG_ID = 'customer_data_etl'
DAG_TAGS = ['etl', 'remote', 's3', 'rabbitmq', 'retail', 'customer', 'for dasboard', 'prepare charts', 'for backend']

# TODO: fix if some jobs crashed, we have no data in mongodb

with DAG(
    dag_id=DAG_ID,
    start_date=datetime(2025, 5, 21),
    schedule='@once',
    catchup=False,
    tags=DAG_TAGS,
) as dag:

    download_task = PythonOperator(
        task_id='download_file_from_s3',
        python_callable=download_file_from_s3,
    )

    detect_type_task = PythonOperator(
        task_id='detect_file_type',
        python_callable=detect_file_type,
    )

    load_df_task = PythonOperator(
        task_id='load_to_pandas_dataframe',
        python_callable=load_to_dataframe,
    )

    analyze_customer_task = PythonOperator(
        task_id='analyze_customer_category_and_send',
        python_callable=analyze_customer_category,
    )

    analyze_payment_task = PythonOperator(
        task_id='analyze_payment_methods_and_send',
        python_callable=analyze_payment_methods,
    )

    analyze_store_task = PythonOperator(
        task_id='analyze_store_type_and_send',
        python_callable=analyze_store_type,
    )

    analyze_city_task = PythonOperator(
        task_id='analyze_city_wordcloud',
        python_callable=analyze_city_wordcloud,
    )

    analyze_customer_wordcloud_task = PythonOperator(
        task_id='analyze_customer_category_wordcloud',
        python_callable=analyze_customer_category_wordcloud,
    )

    analyze_seasons_task = PythonOperator(
        task_id='analyze_seasons',
        python_callable=analyze_seasons,
    )

    analyze_monthly_sales_task = PythonOperator(
        task_id='analyze_monthly_sales',
        python_callable=analyze_monthly_sales,
    )
    
    analyze_city_sales_summary_task = PythonOperator(
        task_id='analyze_city_sales_summary',
        python_callable=analyze_city_sales_summary,
    )
    
    analyze_retail_metrics_task = PythonOperator(
        task_id='analyze_retail_metrics',
        python_callable=analyze_retail_metrics,
    )

    download_task >> detect_type_task >> load_df_task
    load_df_task >> [
        analyze_customer_task,
        analyze_payment_task,
        analyze_store_task,
        analyze_city_task,
        analyze_customer_wordcloud_task,
        analyze_seasons_task,
        analyze_monthly_sales_task,
        analyze_city_sales_summary_task,
        analyze_retail_metrics_task,
    ]
