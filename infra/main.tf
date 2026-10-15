terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0" # Usamos la versión 5.x más reciente y estable
    }
  }
}

provider "aws" {
  region = "us-east-1" # La misma región que se configuró en la consola
}

# 2. RED VIRTUAL (VPC) Y SUBNEDES

# Crear la VPC principal
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "portafolio-vpc"
  }
}

# Crear Subred Pública 1 (Para tu servidor web Flask)
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "portafolio-public-subnet-1"
  }
}

# Crear Subred Pública 2 (Requisito de AWS para las bases de datos RDS)
resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "portafolio-public-subnet-2"
  }
}

# Crear Puerta de Enlace a Internet (Módem virtual)
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id

  tags = {
    Name = "portafolio-igw"
  }
}

# Crear Tabla de Rutas para permitir salida a Internet
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main_vpc.id

  route {
    cidr_block = "0.0.0.0/0" # 0.0.0.0/0 significa "cualquier destino en internet"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "portafolio-public-rt"
  }
}

# Conectar la Subred 1 a la Tabla de Rutas
resource "aws_route_table_association" "rta_subnet_1" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_rt.id
}

# Conectar la Subred 2 a la Tabla de Rutas
resource "aws_route_table_association" "rta_subnet_2" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_rt.id
}

# 3. GRUPOS DE SEGURIDAD (Firewalls)

# Firewall para el Servidor Web (EC2)
resource "aws_security_group" "web_sg" {
  name        = "portafolio-web-sg"
  description = "Permitir trafico HTTP y SSH al servidor web"
  vpc_id      = aws_vpc.main_vpc.id

  # Regla de entrada: Permitir HTTPS (Puerto 443)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Regla de entrada: Permitir HTTP (Puerto 80) desde cualquier lugar de internet
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Regla de entrada: Permitir SSH (Puerto 22) para que puedas administrarlo
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Regla de salida: Permitir que el servidor salga a internet (necesario para descargar Python y Flask)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # -1 significa "todos los protocolos"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "portafolio-web-sg"
  }
}

# Firewall para la Base de Datos (RDS MySQL)
resource "aws_security_group" "db_sg" {
  name        = "portafolio-db-sg"
  description = "Permitir trafico MySQL solo desde el Servidor Web"
  vpc_id      = aws_vpc.main_vpc.id

  # Regla de entrada: Permitir MySQL (Puerto 3306) SOLO desde el Servidor Web
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.web_sg.id] # <- Esto es seguridad de grado empresarial
  }

  # Regla de salida estándar
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "portafolio-db-sg"
  }
}

# 4. BASE DE DATOS (Amazon RDS - MySQL)

# Agrupar las subredes para la Base de Datos
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "portafolio-db-subnet-group"
  subnet_ids = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  tags = {
    Name = "portafolio-db-subnet-group"
  }
}

# Crear la instancia de MySQL
resource "aws_db_instance" "mysql_db" {
  identifier             = "portafolio-db"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"   # Capa gratuita de AWS
  allocated_storage      = 20              # 20 GB de almacenamiento
  db_name                = "portafolio_db" # El mismo nombre que usaste en SQLyog
  username               = "admin"
  password               = "DevOps2026Secure!" # En un entorno real empresarial, esto se oculta con AWS Secrets Manager
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true  # Facilita el borrado de la base de datos más adelante
  publicly_accessible    = false # Bloqueada al público (máxima seguridad)
}

# 5. SERVIDOR WEB (Amazon EC2)

# Buscar automáticamente la imagen (AMI) más reciente de Ubuntu Linux
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # ID oficial del creador de Ubuntu (Canonical)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# Crear la máquina virtual EC2
resource "aws_instance" "web_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro" # Capa gratuita de AWS
  subnet_id              = aws_subnet.public_subnet_1.id
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  # Inyectamos el script de automatización y le pasamos la URL dinámica de la base de datos
  user_data = templatefile("userdata.sh", {
    db_host = aws_db_instance.mysql_db.address
  })

  tags = {
    Name = "portafolio-web-server"
  }
}