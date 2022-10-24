# refer to this
# https://github.com/Midnighter/fastapi-mount/blob/root-path/gunicorn_config.py

worker_class = "src.workers.ConfigurableWorker"
workers = 1
loglevel = 'debug'
accesslog = '/home/ec2-user/app/log/accesslog'
acceslogformat ="%(h)s %(l)s %(u)s %(t)s %(r)s %(s)s %(b)s %(f)s %(a)s"
errorlog =  '/home/ec2-user/app/log/errorlog'