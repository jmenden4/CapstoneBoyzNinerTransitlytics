# refer to this
# https://github.com/Midnighter/fastapi-mount/blob/root-path/gunicorn_config.py

worker_class = "src.workers.ConfigurableWorker"
workers = 1