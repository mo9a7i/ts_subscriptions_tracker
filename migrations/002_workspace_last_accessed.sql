ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;

UPDATE workspaces
SET last_accessed_at = updated_at
WHERE user_id IS NOT NULL AND last_accessed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_user_last_accessed ON workspaces(user_id, last_accessed_at DESC NULLS LAST);
