"""Add original html column

Revision ID: 2a5e53c884d3
Revises: b4737e4f2bae
Create Date: 2026-06-14 15:54:33.243542

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2a5e53c884d3'
down_revision: Union[str, Sequence[str], None] = 'b4737e4f2bae'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('reports', sa.Column('original_html_content', sa.String(), nullable=True))

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('reports', 'original_html_content')
