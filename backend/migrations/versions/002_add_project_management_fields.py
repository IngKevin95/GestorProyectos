"""Add project management fields (EP-001)

Revision ID: 002_add_project_mgmt
Revises: 001_initial
Create Date: 2026-08-01 03:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_add_project_mgmt'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to projects table
    op.add_column('projects', sa.Column('responsable', sa.String(255), nullable=False, server_default=''))
    op.add_column('projects', sa.Column('status', sa.String(50), nullable=False, server_default='Activo'))
    op.add_column('projects', sa.Column('prioridad', sa.String(50), nullable=True))
    op.add_column('projects', sa.Column('fecha_limite', sa.Date(), nullable=True))
    op.add_column('projects', sa.Column('siguiente_paso', sa.String(1000), nullable=True))
    op.add_column('projects', sa.Column('bloqueos', sa.String(1000), nullable=True))
    op.add_column('projects', sa.Column('notas', sa.Text(), nullable=True))
    op.add_column('projects', sa.Column('tipo_proyecto', sa.String(50), nullable=True))

    # Add indexes for common queries
    op.create_index('idx_projects_status', 'projects', ['status'])
    op.create_index('idx_projects_priority', 'projects', ['prioridad'])


def downgrade() -> None:
    # Remove indexes
    op.drop_index('idx_projects_priority', 'projects')
    op.drop_index('idx_projects_status', 'projects')

    # Remove columns
    op.drop_column('projects', 'tipo_proyecto')
    op.drop_column('projects', 'notas')
    op.drop_column('projects', 'bloqueos')
    op.drop_column('projects', 'siguiente_paso')
    op.drop_column('projects', 'fecha_limite')
    op.drop_column('projects', 'prioridad')
    op.drop_column('projects', 'status')
    op.drop_column('projects', 'responsable')
