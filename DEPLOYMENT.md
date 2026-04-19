# Deployment Notes

## Server
- Host: workhrms.in
- Repo path: /home/ubuntu/updtfl
- Frontend path: /home/ubuntu/updtfl/Nhrms
- Web root: /var/www/workhrms
- NGINX config: /etc/nginx/sites-available/default

## Backend deploy
cd /home/ubuntu/updtfl
docker-compose down
docker-compose up -d --build

## Frontend deploy
cd /home/ubuntu/updtfl/Nhrms
npx expo export --platform web
cp -r dist/* /var/www/workhrms/
sudo systemctl restart nginx

## Backup
/home/ubuntu/backup_db.sh
