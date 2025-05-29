import os
import json

import pika

from utils.load_config import load_config

APP_MODE = os.getenv('MODE', 'development')

config_global = load_config(APP_MODE)
config_rabbitmq = config_global['services']['rabbitmq']

def send_to_rabbitmq(payload: dict):
    rabbitmq_url = config_rabbitmq['url']
    queue_name = config_rabbitmq['queue']
    connection_params = pika.URLParameters(rabbitmq_url)

    with pika.BlockingConnection(connection_params) as connection:
        channel = connection.channel()
        channel.queue_declare(queue=queue_name, durable=True)
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=json.dumps(payload).encode('utf-8'),
            properties=pika.BasicProperties(delivery_mode=2)
        )
