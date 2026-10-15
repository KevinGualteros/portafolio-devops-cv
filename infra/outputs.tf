output "direccion_ip_portafolio" {
  description = "Copia esta IP y pégala en tu navegador web"
  value       = aws_instance.web_server.public_ip
}