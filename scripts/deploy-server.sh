pyclean --verbose server/src
ssh -i ../admin.pem ec2-user@transit-ninerlytics.com 'rm -rf /home/ec2-user/app/server/src'
scp -i ../admin.pem -r server/src ec2-user@transit-ninerlytics.com:/home/ec2-user/app/server/src
scp -i ../admin.pem -r server/requirements.txt ec2-user@transit-ninerlytics.com:/home/ec2-user/app/server
scp -i ../admin.pem -r server/gunicorn_config.py ec2-user@transit-ninerlytics.com:/home/ec2-user/app/server
ssh -i ../admin.pem ec2-user@transit-ninerlytics.com 'sudo systemctl restart ninerlytics-api.service'
