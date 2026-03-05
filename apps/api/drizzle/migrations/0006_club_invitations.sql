-- Club invitations table for private clubs
CREATE TABLE IF NOT EXISTS club_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id),
  invitee_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS club_invitations_invitee_idx ON club_invitations (invitee_id, status);
CREATE INDEX IF NOT EXISTS club_invitations_club_idx ON club_invitations (club_id);
