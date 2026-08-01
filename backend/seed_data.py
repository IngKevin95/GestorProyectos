import asyncio
import uuid
import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from src.models.db_models import User, Project, Task
from src.core.security import hash_password
from sqlalchemy import select

# Configurar conexión a la BD
DATABASE_URL = "postgresql+asyncpg://gestor:password@postgres:5432/gestor_proyectos"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed():
    async with AsyncSessionLocal() as session:
        # 1. Crear o buscar usuario de prueba
        stmt = select(User).where(User.email == "admin@empresa.com")
        result = await session.execute(stmt)
        existing_user = result.scalars().first()

        if existing_user:
            test_user_id = existing_user.id
            print(f"Usuario existente encontrado con ID: {test_user_id}")
        else:
            test_user_id = uuid.uuid4()
            user = User(
                id=test_user_id,
                email="admin@empresa.com",
                password_hash=hash_password("admin123"),
                role="admin"
            )
            session.add(user)
            await session.commit()
            print(f"Usuario creado con ID: {test_user_id}")

        # 2. Crear proyectos variados
        proyectos_data = [
            # Proyecto 1: Saludable, alta prioridad de negocio, urgente
            {
                "name": "Migración a Cloud",
                "total_effort": 120.0,
                "state": "ACTIVE",
                "status": "Activo",
                "prioridad": "Alta",
                "fecha_limite": datetime.date.today() + datetime.timedelta(days=2),
                "siguiente_paso": "Aprovisionar servidores",
                "bloqueos": "",
                "health_status": "ok",
                "business_value": 9.5,
                "priority_strategy": "relative"
            },
            # Proyecto 2: En Riesgo (cerca de vencer), tareas abiertas
            {
                "name": "Lanzamiento App Móvil",
                "total_effort": 200.0,
                "state": "ACTIVE",
                "status": "Activo",
                "prioridad": "Alta",
                "fecha_limite": datetime.date.today() + datetime.timedelta(days=5),
                "siguiente_paso": "Subir a tiendas",
                "bloqueos": "",
                "health_status": "at_risk",
                "business_value": 8.0,
                "priority_strategy": "relative",
                "open_tasks": 2
            },
            # Proyecto 3: Bloqueado
            {
                "name": "Integración ERP",
                "total_effort": 300.0,
                "state": "PAUSED",
                "status": "En Pausa",
                "prioridad": "Media",
                "fecha_limite": datetime.date.today() + datetime.timedelta(days=15),
                "siguiente_paso": "Esperar API",
                "bloqueos": "El proveedor no ha entregado las credenciales",
                "health_status": "blocked",
                "business_value": 7.0,
                "priority_strategy": "relative"
            },
            # Proyecto 4: Sin Siguiente Paso
            {
                "name": "Rediseño Web",
                "total_effort": 80.0,
                "state": "PLANNING",
                "status": "Activo",
                "prioridad": "Baja",
                "fecha_limite": datetime.date.today() + datetime.timedelta(days=40),
                "siguiente_paso": "",
                "bloqueos": "",
                "health_status": "no_next_step",
                "business_value": 4.0,
                "priority_strategy": "relative"
            }
        ]

        for p_data in proyectos_data:
            p = Project(**p_data, user_id=test_user_id)
            session.add(p)
            await session.commit()
            
            # Agregar tareas al proyecto "Lanzamiento App Móvil" para forzar "at_risk" de forma natural
            if p.name == "Lanzamiento App Móvil":
                t1 = Task(project_id=p.id, title="Revisión QA", status="abierta", assignee="jperez@empresa.com", priority="alta")
                t2 = Task(project_id=p.id, title="Aprobación de marketing", status="abierta", assignee="mlopez@empresa.com", priority="media")
                session.add_all([t1, t2])
                await session.commit()
                
            # Tarea vencida para "Integración ERP" (además del bloqueo manual)
            if p.name == "Integración ERP":
                t3 = Task(project_id=p.id, title="Firma de contrato", status="vencida", assignee="admin@empresa.com", priority="alta")
                session.add(t3)
                await session.commit()

        print("Base de datos poblada exitosamente con proyectos de prueba.")

if __name__ == "__main__":
    asyncio.run(seed())
