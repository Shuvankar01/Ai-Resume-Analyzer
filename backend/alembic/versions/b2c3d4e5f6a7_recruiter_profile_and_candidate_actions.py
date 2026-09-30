"""Recruiter profile + candidate action tables

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-09-29 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # --- Recruiter Profiles Table ---
    # A missing row means "never onboarded"; every column is nullable so a
    # half-finished wizard still persists.
    op.create_table(
        'recruiter_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('company_name', sa.String(), nullable=True),
        sa.Column('industry', sa.String(), nullable=True),
        sa.Column('designation', sa.String(), nullable=True),
        sa.Column('hiring_goals', sa.Text(), nullable=True),
        sa.Column('experience_level', sa.String(), nullable=True),
        sa.Column('tech_stack', sa.Text(), nullable=True),
        sa.Column('bio_summary', sa.Text(), nullable=True),
        sa.Column('source_filename', sa.String(), nullable=True),
        sa.Column('onboarding_completed', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recruiter_profiles_id'), 'recruiter_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_recruiter_profiles_user_id'), 'recruiter_profiles', ['user_id'], unique=True)

    # --- Candidate Actions Table ---
    # Durable record of shortlist / reject / interview / offer decisions.
    op.create_table(
        'candidate_actions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('recruiter_id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=True),
        sa.Column('candidate_name', sa.String(), nullable=False),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('ats_score', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('scheduled_for', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['candidate_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['recruiter_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_candidate_actions_id'), 'candidate_actions', ['id'], unique=False)
    op.create_index(op.f('ix_candidate_actions_candidate_id'), 'candidate_actions', ['candidate_id'], unique=False)
    op.create_index(op.f('ix_candidate_actions_recruiter_id'), 'candidate_actions', ['recruiter_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_candidate_actions_recruiter_id'), table_name='candidate_actions')
    op.drop_index(op.f('ix_candidate_actions_candidate_id'), table_name='candidate_actions')
    op.drop_index(op.f('ix_candidate_actions_id'), table_name='candidate_actions')
    op.drop_table('candidate_actions')
    op.drop_index(op.f('ix_recruiter_profiles_user_id'), table_name='recruiter_profiles')
    op.drop_index(op.f('ix_recruiter_profiles_id'), table_name='recruiter_profiles')
    op.drop_table('recruiter_profiles')
