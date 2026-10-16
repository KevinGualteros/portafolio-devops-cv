# Portafolio DevOps CV

Portafolio profesional desarrollado con Flask, HTML, CSS y JavaScript para presentar experiencia, proyectos y conocimientos en ingeniería, cloud y DevOps. La aplicación incluye un formulario de comentarios con persistencia en MySQL y una infraestructura de despliegue en AWS gestionada con Terraform.

## Descripción general

Este repositorio combina tres capas clave:

- Frontend: landing page profesional con diseño responsive y contenido personal.
- Backend: API y lógica de negocio desarrollada en Python con Flask.
- Infraestructura: recursos en AWS (VPC, EC2, RDS, grupos de seguridad) definidos con Terraform.

La idea principal es demostrar habilidades en:

- Desarrollo web full-stack
- Infraestructura como código
- Despliegue y automatización en la nube
- Proyectos de DevOps aplicados a un caso real

## Stack tecnológico

- Python 3
- Flask 3.0.2
- PyMySQL 1.1.0
- MySQL / RDS
- HTML, CSS y JavaScript
- Terraform
- AWS EC2 y RDS
- Gunicorn
- GitHub Actions (planeado / en evolución)

## Estructura del repositorio

```text
portafolio-devops-cv/
├── app/
│   ├── app.py
│   ├── requirements.txt
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── FotoCV.jpeg
│   └── templates/
│       └── index.html
├── infra/
│   ├── main.tf
│   ├── outputs.tf
│   ├── userdata.sh
│   ├── variables.tf
│   └── terraform.tfstate
├── .gitignore
├── README.md
├── terraform.tfstate
└── .env.example
```

## Funcionalidades

- Landing page profesional con información académica, experiencia y proyectos.
- Sección de proyectos y formación técnica.
- Formulario de contacto / comentarios almacenado en base de datos.
- Visualización de comentarios desde la base de datos en la página principal.
- Chatbot de prueba integrado en la interfaz.
- Infraestructura desplegable con Terraform para un entorno AWS reproducible.

## Requisitos locales

Antes de ejecutar la aplicación localmente, asegúrate de tener instalado:

- Python 3.10+
- pip
- MySQL Server o un servicio MySQL accesible
- Git

## Configuración local

1. Clona el repositorio:

```bash
git clone https://github.com/KevinGualteros/portafolio-devops-cv.git
cd portafolio-devops-cv
```

2. Crea un entorno virtual:

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# o en Windows:
# venv\Scripts\activate
```

3. Instala las dependencias:

```bash
pip install -r app/requirements.txt
```

4. Crea el archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

5. Ajusta las variables de entorno en `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=portafolio_db
```

6. Crea la base de datos y la tabla `feedback`:

```sql
CREATE DATABASE IF NOT EXISTS portafolio_db;
USE portafolio_db;

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  mensaje TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

7. Ejecuta la aplicación:

```bash
cd app
python app.py
```

La aplicación estará disponible en:

- http://localhost:5000

## Variables de entorno

El proyecto usa un archivo `.env` para configurar la conexión a la base de datos.

Ejemplo de configuración:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=portafolio_db
```

Nota: el archivo `.env` no debe versionarse. Se encuentra excluido en `.gitignore`.

## Despliegue en AWS con Terraform

La carpeta `infra/` contiene la infraestructura necesaria para crear un entorno en AWS.

### Recursos incluidos

- VPC
- Subredes públicas
- Internet Gateway
- Security Groups
- Instancia EC2
- Base de datos RDS MySQL
- User data para automatizar el despliegue de la app

### Ejecución

```bash
cd infra
terraform init
terraform plan
terraform apply
```

El despliegue usa `userdata.sh` para:

- instalar dependencias de Python
- clonar el repositorio
- preparar el entorno virtual
- instalar Flask y Gunicorn
- crear el archivo `.env` con la configuración de la base de datos
- crear la tabla `feedback`
- levantar el servicio con Systemd en el puerto 80

## Seguridad

Este repositorio es un proyecto educativo y de portfolio, pero conviene aplicar buenas prácticas de seguridad:

- No incluir credenciales reales en el repositorio.
- Usar AWS Secrets Manager o variables de entorno cifradas en entornos reales.
- Evitar `debug=True` en producción.
- Restringir puertos y accesos en grupos de seguridad.
- Mantener dependencias actualizadas.

## Roadmap

- Mejorar la gestión de variables de entorno y secretos.
- Añadir pruebas automatizadas para la base de datos y rutas del backend.
- Integrar un chatbot real con un proveedor externo de IA.
- Configurar CI/CD completo con GitHub Actions.
- Mejorar la seguridad y la arquitectura para entorno de producción.

## Licencia

Este proyecto está destinado a uso personal y académico. Revisa el alcance de licencia antes de reutilizarlo en entornos comerciales.

## Autor

Kevin Gualteros

- GitHub: https://github.com/KevinGualteros
- LinkedIn: https://www.linkedin.com/in/kevin-gualteros-jimenez-electronic-engineer/
