# Portafolio DevOps CV

Aplicación web de portafolio desarrollada con Flask, HTML, CSS y JavaScript.
Incluye un formulario de comentarios que persiste en MySQL y archivos Terraform
para preparar infraestructura de demostración en AWS.

## Funcionalidades

- Presentación de perfil, formación y proyectos.
- Formulario para guardar y mostrar comentarios en MySQL.
- Ruta `/chat` con respuesta simulada; no es una integración activa con un
  servicio de inteligencia artificial.
- Definición de infraestructura AWS con Terraform.

## Tecnologías

- Python 3 y Flask
- PyMySQL y MySQL
- HTML, CSS y JavaScript
- Terraform y AWS (EC2, VPC y RDS)
- Gunicorn para servir la aplicación en el despliegue de ejemplo

Las dependencias de Python están declaradas en `app/requirements.txt`.

## Estructura

```text
app/
  app.py
  requirements.txt
  static/
  templates/
infra/
  main.tf
  outputs.tf
  userdata.sh
  variables.tf
.github/
  workflows/
.env.example
README.md
```

## Ejecución local

Requisitos: Python 3, pip y una instancia MySQL accesible.

1. Clona el repositorio y crea un entorno virtual:

   ```powershell
   git clone https://github.com/KevinGualteros/portafolio-devops-cv.git
   cd portafolio-devops-cv
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   En Linux o macOS, activa el entorno con `source .venv/bin/activate`.

2. Instala las dependencias:

   ```shell
   python -m pip install -r app/requirements.txt
   ```

3. Crea la base de datos y la tabla que utiliza el formulario:

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

4. Define `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` en el entorno donde
   iniciarás la aplicación. Por ejemplo, en PowerShell:

   ```powershell
   $env:DB_HOST = "localhost"
   $env:DB_USER = "root"
   $env:DB_PASSWORD = "<contraseña-local>"
   $env:DB_NAME = "portafolio_db"
   ```

   Aunque existe `.env.example`, la aplicación intenta cargar `.env` desde una
   ruta fija de Linux. Para desarrollo local en otro sistema, configura las
   variables en el entorno como en el ejemplo anterior.

5. Inicia la aplicación:

   ```powershell
   Set-Location app
   python app.py
   ```

   Abre `http://localhost:5000` en el navegador. El servidor integrado de Flask
   se ejecuta en modo de depuración según la configuración actual; úsalo solo
   para desarrollo local.

## Infraestructura de demostración en AWS

La carpeta `infra/` define recursos de red, una instancia EC2 y una instancia
RDS MySQL. La región configurada actualmente es `us-east-1`; el archivo
`userdata.sh` prepara la aplicación y el servicio Gunicorn en la instancia.

Hay una diferencia de rutas que debe resolverse antes de desplegar: `app/app.py`
busca `.env` en la raíz del repositorio en una ruta fija de Linux, mientras que
`infra/userdata.sh` crea el archivo dentro de `app/`. En el estado actual, la
aplicación no leerá automáticamente las variables que inicializa ese script.

**No apliques esta configuración en producción tal como está.** Antes de
desplegar, revisa y sustituye la gestión de credenciales definida en los
archivos Terraform y de inicialización; usa un gestor de secretos y evita
guardar contraseñas en el código, en el estado de Terraform o en los datos de
usuario. Si alguna credencial incluida en una versión anterior llegó a usarse,
rótala. Revisa también las reglas de red y los costos de los recursos de AWS.

Cuando la configuración haya sido revisada y tengas credenciales AWS válidas:

```shell
cd infra
terraform init
terraform validate
terraform plan
```

Revisa el plan antes de aplicar cambios. El despliegue puede generar costos.
El resultado `direccion_ip_portafolio` muestra la IP pública de EC2. Para
eliminar los recursos de demostración, revisa el plan de destrucción antes de
ejecutar `terraform destroy`.

## Configuración y seguridad

- `.env` no debe versionarse; usa `.env.example` como referencia y coloca
  valores reales únicamente en el entorno local.
- No publiques contraseñas, claves de acceso ni archivos de estado de
  Terraform.
- Restringe los puertos y orígenes de red a lo necesario para tu entorno.
- Desactiva el modo de depuración y configura un servidor adecuado antes de
  cualquier despliegue público.

## Autor

Kevin Gualteros · [GitHub](https://github.com/KevinGualteros)
