"""
Add health_status column to projects table (EP-002: Health Detection Engine)

Revision ID: 003
Create Date: 2026-08-01
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add health_status column and enum type"""

    # Create the health status enum type
    health_status_enum = postgresql.ENUM(
        'ok', 'blocked', 'at_risk', 'no_next_step',
        name='project_health_status',
        create_type=True
    )
    health_status_enum.create(op.get_bind(), checkfirst=True)

    # Add health_status column to projects table
    op.add_column(
        'projects',
        sa.Column(
            'health_status',
            health_status_enum,
            nullable=False,
            server_default='ok',
            comment='Health classification: ok, blocked, at_risk, or no_next_step (EP-002)'
        )
    )


def downgrade() -> None:
    """Remove health_status column and enum type"""

    # Drop the column
    op.drop_column('projects', 'health_status')

    # Drop the enum type
    op.execute('DROP TYPE IF EXISTS project_health_status')
