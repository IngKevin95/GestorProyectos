"""Pytest configuration for backend tests"""
import pytest
import sys
import os
from pathlib import Path

# Setup path and env before imports
backend_root = Path(__file__).parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://gestor:password@localhost:5432/gestor_proyectos")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
