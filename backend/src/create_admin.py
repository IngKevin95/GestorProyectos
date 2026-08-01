import asyncio
import uuid
from datetime import datetime, UTC

from sqlalchemy.ext.asyncio import create_async_engine
from src.core.config import get_settings
from src.models.db_models import Base, User
from src.core.security import hash_password
from src.core.database import AsyncSessionLocal

async def reset_db_and_create_admin():
    settings = get_settings()
    engine = create_async_engine(settings.database_url, echo=True)
    
    print("Recreando el esquema de la base de datos...")
    async with engine.begin() as conn:
        from sqlalchemy import text
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.run_sync(Base.metadata.create_all)
    
    print("Base de datos recreada.")
    print("Creando usuario admin...")
    
    async with AsyncSessionLocal() as session:
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
        print("Usuario creado: admin@empresa.com / admin123")

if __name__ == "__main__":
    asyncio.run(reset_db_and_create_admin())
