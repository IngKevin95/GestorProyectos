# Entregables - Gestor de Proyectos

## 1. Prototipo Funcional e Instrucciones para Levantarlo

El sistema está contenerizado con Docker para garantizar que funcione idéntico en cualquier máquina.

### Requisitos
*   Docker y Docker Compose instalados.
*   Node.js (opcional, si deseas correr el frontend de forma local sin Docker).
*   Python 3.11+ (opcional, si deseas correr el backend de forma local sin Docker).

### Cómo levantar el proyecto completo (Vía Docker)
1. En la raíz del proyecto, copia el archivo de entorno:
   ```bash
   cp .env.example .env
   ```
2. Levanta los contenedores (Base de datos, Backend y Frontend):
   ```bash
   docker-compose up -d
   ```
3. Espera unos 15 segundos a que la base de datos se inicialice. Las rutas estarán disponibles en:
   *   **Frontend:** `http://localhost:3000`
   *   **Backend (API):** `http://localhost:8000`
   *   **Documentación API (Swagger):** `http://localhost:8000/docs`

### 2. Ejemplos de Proyectos con distintos estados y prioridades
Se ha creado un script en Python (`backend/seed_data.py`) que puebla la base de datos con un usuario administrador y 4 proyectos estratégicos que fuerzan los distintos estados de salud y prioridades para que el evaluador pueda ver todo en acción.

**Para ejecutar el script de seed:**
1. Asegúrate de tener las dependencias de Python instaladas en tu entorno virtual (si estás local):
   ```bash
   cd backend
   pip install -r requirements.txt
   python seed_data.py
   ```
   *(Si lo corres dentro de docker: `docker-compose exec backend python seed_data.py`)*

2. Ingresa a `http://localhost:3000` e inicia sesión con las credenciales que imprime el script:
   *   **Email:** `admin@empresa.com`
   *   **Password:** `admin123`

---



