"""
Add priority configuration columns to projects table (EP-003: Vista de Cartera)

Revision ID: 004
Create Date: 2026-08-01
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add priority_strategy, priority_constant, and business_value columns"""

    # Create the priority_strategy enum type
    priority_strategy_enum = postgresql.ENUM(
        'relative', 'absolute', 'mixed',
        name='priority_strategy_enum',
        create_type=True
    )
    priority_strategy_enum.create(op.get_bind(), checkfirst=True)

    # Add columns to projects table
    op.add_column(
        'projects',
        sa.Column(
            'priority_strategy',
            priority_strategy_enum,
            nullable=False,
            server_default='relative',
            comment='Strategy for priority scoring: relative, absolute, mixed (EP-003)'
        )
    )
    
    op.add_column(
        'projects',
        sa.Column(
            'priority_constant',
            sa.Numeric(15, 2),
            nullable=False,
            server_default='0.0',
            comment='Absolute score value when using absolute strategy (EP-003)'
        )
    )

    op.add_column(
        'projects',
        sa.Column(
            'business_value',
            sa.Numeric(15, 2),
            nullable=False,
            server_default='0.0',
            comment='Business value modifier for mixed/relative strategies (EP-003)'
        )
    )


def downgrade() -> None:
    """Remove priority configuration columns"""

    # Drop the columns
    op.drop_column('projects', 'business_value')
    op.drop_column('projects', 'priority_constant')
    op.drop_column('projects', 'priority_strategy')

    # Drop the enum type
    op.execute('DROP TYPE IF EXISTS priority_strategy_enum')
