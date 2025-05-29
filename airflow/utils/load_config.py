import os
import json

CONFIG_LOCAL_PATH = os.path.join(os.path.dirname(__file__), '../configs/app.local.json')

def load_config(mode: str):
    if mode == 'production':
        raise NotImplementedError("Production config not implemented")
    elif mode == 'development':
        with open(CONFIG_LOCAL_PATH, 'r') as f:
            return json.load(f)
    return None
