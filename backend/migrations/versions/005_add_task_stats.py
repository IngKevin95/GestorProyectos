"""
Add task statistics columns to projects table (EP-004: Gestión de Tareas)

Revision ID: 005
Create Date: 2026-08-01
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add open_tasks and overdue_tasks counter columns to projects table."""

    op.add_column(
        'projects',
        sa.Column(
            'open_tasks',
            sa.Integer(),
            nullable=False,
            server_default='0',
            comment='Cached count of open/blocked tasks for health detection (EP-004)'
        )
    )

    op.add_column(
        'projects',
        sa.Column(
            'overdue_tasks',
            sa.Integer(),
            nullable=False,
            server_default='0',
            comment='Cached count of overdue tasks for health detection (EP-004)'
        )
    )


def downgrade() -> None:
    """Remove task statistics columns from projects table."""

    op.drop_column('projects', 'overdue_tasks')
    op.drop_column('projects', 'open_tasks')
