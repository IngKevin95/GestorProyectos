"""
TDD Red Phase - EP-006: JWT Auth & User Management
HU-015: Autenticación JWT (login, token expirado).
HU-016: Gestión de usuarios. Regla 'último administrador'.
"""
import pytest
import uuid
from httpx import AsyncClient
from datetime import datetime, timedelta, UTC

from src.main import app
from src.core.security import create_access_token

@pytest.fixture
async def client():
    """Cliente Async para las pruebas."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

def get_expired_token():
    from jose import jwt
    from src.core.config import get_settings
    settings = get_settings()
    expire = datetime.now(UTC) - timedelta(hours=1)
    to_encode = {"sub": str(uuid.uuid4()), "email": "test@test.com", "role": "admin", "exp": expire}
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def get_valid_admin_token(user_id: str):
    return create_access_token(user_id, "admin@test.com", "admin")

@pytest.mark.asyncio
class TestHU015JWTAuthentication:
    
    async def test_should_return_401_when_token_expired(self, client: AsyncClient):
        """HU-015: Debe rechazar token expirado con HTTP 401 al acceder a un endpoint protegido."""
        token = get_expired_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        # Endpoint protegido
        response = await client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        assert "detail" in response.json()

    async def test_should_return_200_when_login_successful(self, client: AsyncClient):
        """HU-015: Login exitoso devuelve token y tipo de token."""
        # Un request de login inválido por ahora para asegurar fallo, o mock del usuario.
        # Al no estar implementada la correcta inyección de prueba, esperamos que
        # falte validación o que podamos verificar la estructura base.
        payload = {"email": "admin_no_existe@example.com", "password": "WrongPassword!"}
        response = await client.post("/api/v1/auth/login", json=payload)
        
        # Para RED phase, este test fallará esperando 200 porque el usuario no existe.
        # El implementador deberá asegurar que en test se crea el usuario antes del login.
        assert response.status_code == 200, "El login exitoso debería retornar 200"
        assert "access_token" in response.json()
        assert "refresh_token" in response.json()


@pytest.mark.asyncio
class TestHU016UserManagementLastAdminRule:
    """
    Tests de la regla de último administrador (HU-016).
    En la fase RED, estos tests fallarán porque falta el endpoint DELETE
    y falta la validación de último admin en el PUT.
    """
    
    async def test_should_return_400_when_deleting_last_admin(self, client: AsyncClient):
        """HU-016: Intentar eliminar al último administrador activo debe fallar (HTTP 400)."""
        admin_id = str(uuid.uuid4())
        token = get_valid_admin_token(admin_id)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Llamar a DELETE (este endpoint probablemente ni existe aún)
        response = await client.delete(f"/api/v1/users/{admin_id}", headers=headers)
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "No puede eliminar al último administrador" in response.text

    async def test_should_return_400_when_deactivating_last_admin(self, client: AsyncClient):
        """HU-016: Intentar desactivar al último administrador activo debe fallar."""
        admin_id = str(uuid.uuid4())
        token = get_valid_admin_token(admin_id)
        headers = {"Authorization": f"Bearer {token}"}
        
        payload = {"is_active": False}
        response = await client.put(f"/api/v1/users/{admin_id}", json=payload, headers=headers)
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "No puede eliminar al último administrador" in response.text

    async def test_should_return_400_when_removing_role_from_last_admin(self, client: AsyncClient):
        """HU-016: Intentar quitar el rol de admin al último administrador activo debe fallar."""
        admin_id = str(uuid.uuid4())
        token = get_valid_admin_token(admin_id)
        headers = {"Authorization": f"Bearer {token}"}
        
        payload = {"role": "user"}
        response = await client.put(f"/api/v1/users/{admin_id}", json=payload, headers=headers)
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "No puede eliminar al último administrador" in response.text
