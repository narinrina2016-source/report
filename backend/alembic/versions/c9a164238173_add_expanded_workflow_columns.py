"""Add expanded workflow columns

Revision ID: c9a164238173
Revises: 2a5e53c884d3
Create Date: 2026-06-14 16:34:21.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9a164238173'
down_revision: Union[str, Sequence[str], None] = '2a5e53c884d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('reports', sa.Column('department_head_id', sa.Integer(), nullable=True))
    op.add_column('reports', sa.Column('admin_id', sa.Integer(), nullable=True))
    op.add_column('reports', sa.Column('reference_number', sa.String(), nullable=True))
    op.add_column('reports', sa.Column('qr_code_path', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('reports', 'qr_code_path')
    op.drop_column('reports', 'reference_number')
    op.drop_column('reports', 'admin_id')
    op.drop_column('reports', 'department_head_id')
