import asyncio
import os
import sys

# Agregamos el backend al PYTHONPATH para importar src
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../backend"))

from src.core.database import async_session_maker
from src.models.db_models import User
from src.core.security import hash_password
import uuid
from datetime import datetime, UTC

async def create_user():
    print("Creando usuario administrador...")
    async with async_session_maker() as session:
        # Check if exists
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == 'admin@empresa.com'))
        if result.scalar_one_or_none():
            print("El usuario admin@empresa.com ya existe.")
            return

        user = User(
            id=uuid.uuid4(),
            email='admin@empresa.com',
            password_hash=hash_password('admin123'),
            role='admin',
            is_active=True,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC)
        )
        session.add(user)
        await session.commit()
        print("Usuario creado con éxito!")
        print("Email: admin@empresa.com")
        print("Password: admin123")

if __name__ == "__main__":
    asyncio.run(create_user())
