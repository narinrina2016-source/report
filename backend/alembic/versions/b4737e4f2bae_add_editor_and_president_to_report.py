"""Add editor and president to report

Revision ID: b4737e4f2bae
Revises: daf0b6063cdb
Create Date: 2026-06-14 15:44:29.053458

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b4737e4f2bae'
down_revision: Union[str, Sequence[str], None] = 'daf0b6063cdb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('reports', sa.Column('editor_id', sa.Integer(), nullable=True))
    op.add_column('reports', sa.Column('president_id', sa.Integer(), nullable=True))

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('reports', 'president_id')
    op.drop_column('reports', 'editor_id')
