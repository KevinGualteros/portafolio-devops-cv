#!/bin/bash
# 1. Actualizar el servidor e instalar herramientas base
apt-get update -y
apt-get install -y python3-pip python3-venv git mysql-client

# 2. Descargar tu código desde GitHub
cd /home/ubuntu
git clone https://github.com/KevinGualteros/portafolio-devops-cv.git
cd portafolio-devops-cv

# 3. Preparar el entorno de Python
python3 -m venv venv
source venv/bin/activate
pip install -r app/requirements.txt
pip install gunicorn

# 4. Crear el archivo .env dinámicamente con los datos de RDS inyectados por Terraform
cat <<EOT >> app/.env
DB_HOST=${db_host}
DB_USER=admin
DB_PASSWORD=DevOps2026Secure!
DB_NAME=portafolio_db
EOT

# 5. Conectarse a RDS y crear la tabla "feedback" automáticamente
mysql -h ${db_host} -u admin -pDevOps2026Secure! portafolio_db -e "CREATE TABLE IF NOT EXISTS feedback (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100) NOT NULL, mensaje TEXT NOT NULL, fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

# 6. Configurar Systemd para que la web (Gunicorn) corra en segundo plano 24/7 y por el puerto 80
cat <<EOT >> /etc/systemd/system/portafolio.service
[Unit]
Description=Gunicorn instance to serve Flask Portfolio
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/portafolio-devops-cv/app
Environment="PATH=/home/ubuntu/portafolio-devops-cv/venv/bin"
ExecStart=/home/ubuntu/portafolio-devops-cv/venv/bin/gunicorn --bind 0.0.0.0:80 app:app

[Install]
WantedBy=multi-user.target
EOT

# 7. Iniciar el servicio web
systemctl start portafolio
systemctl enable portafolio