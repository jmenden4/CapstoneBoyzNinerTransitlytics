pyclean --verbose server/src
scp -i ../admin.pem -r server/src/* ec2-user@ec2-3-144-148-29.us-east-2.compute.amazonaws.com:/home/ec2-user/app/server/src
scp -i ../admin.pem -r server/requirements.txt ec2-user@ec2-3-144-148-29.us-east-2.compute.amazonaws.com:/home/ec2-user/app/server
scp -i ../admin.pem -r server/gunicorn_config.py ec2-user@ec2-3-144-148-29.us-east-2.compute.amazonaws.com:/home/ec2-user/app/server