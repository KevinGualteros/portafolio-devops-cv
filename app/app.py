from flask import Flask, render_template, request, jsonify, redirect, url_for
import pymysql

app = Flask(__name__)

import os
from dotenv import load_dotenv

# Carga las variables ocultas del archivo .env
load_dotenv() 

DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'portafolio_db'),
    'cursorclass': pymysql.cursors.DictCursor
}

# Función auxiliar para conectarnos a la BD
def get_db_connection():
    try:
        return pymysql.connect(**DB_CONFIG)
    except Exception as e:
        print(f"Error conectando a la BD: {e}")
        return None

# 1. Ruta Principal: Ahora también lee los comentarios
@app.route('/')
def index():
    conexion = get_db_connection()
    comentarios = []
    if conexion:
        try:
            with conexion.cursor() as cursor:
                # Restaurado a la tabla 'feedback'
                cursor.execute("SELECT nombre, mensaje, fecha FROM feedback ORDER BY fecha DESC")
                comentarios = cursor.fetchall()
        finally:
            conexion.close()
            
    # Le pasamos la lista de comentarios al HTML
    return render_template('index.html', comentarios=comentarios)

# 2. Ruta para recibir y GUARDAR el Feedback
@app.route('/submit', methods=['POST'])
def submit_feedback():
    nombre = request.form.get('nombre')
    mensaje = request.form.get('mensaje')
    
    conexion = get_db_connection()
    if conexion:
        try:
            with conexion.cursor() as cursor:
                # Restaurado a la tabla 'feedback'
                sql = "INSERT INTO feedback (nombre, mensaje) VALUES (%s, %s)"
                cursor.execute(sql, (nombre, mensaje))
            conexion.commit()
        finally:
            conexion.close()
            
    return redirect(url_for('index') + '#feedback')

# 3. Ruta para el Chatbot (Sin cambios por ahora)
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    respuesta_simulada = f"Soy el backend en Python. Recibí: '{user_message}'."
    return jsonify({"reply": respuesta_simulada})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)