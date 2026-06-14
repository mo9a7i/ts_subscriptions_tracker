CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'My Subscriptions',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
  settings JSONB NOT NULL DEFAULT '{}',
  sharing_uuid UUID UNIQUE
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_payment TEXT NOT NULL,
  start_date TEXT,
  url TEXT,
  icon TEXT,
  comment TEXT,
  labels TEXT[] NOT NULL DEFAULT '{}',
  auto_renewal BOOLEAN NOT NULL DEFAULT TRUE,
  colors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace_id ON subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_sharing_uuid ON workspaces(sharing_uuid);

CREATE OR REPLACE VIEW shared_subscriptions AS
SELECT
  s.id,
  s.workspace_id,
  s.name,
  s.amount,
  s.currency,
  s.frequency,
  s.next_payment,
  s.start_date,
  s.url,
  s.icon,
  s.comment,
  s.labels,
  s.auto_renewal,
  s.colors,
  s.created_at,
  s.updated_at,
  w.sharing_uuid,
  w.name AS workspace_name
FROM subscriptions s
JOIN workspaces w ON s.workspace_id = w.id
WHERE w.sharing_uuid IS NOT NULL;
