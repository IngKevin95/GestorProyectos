"""Migration: Add health column to projects table (EP-002)"""

from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    op.add_column(
        'projects',
        sa.Column('health', sa.String(50), nullable=False, server_default='Ok')
    )


def downgrade() -> None:
    op.drop_column('projects', 'health')
