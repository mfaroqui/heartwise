-- Pending Assessments table for delayed physician review delivery
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pending_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT DEFAULT '',
  tool_name TEXT NOT NULL,
  tool_id TEXT DEFAULT '',
  
  -- Instant preview (shown immediately)
  preview_html TEXT NOT NULL,
  preview_text TEXT DEFAULT '',
  
  -- Full assessment (delivered later)
  full_html TEXT NOT NULL,
  full_text TEXT DEFAULT '',
  
  -- Delivery scheduling
  created_at TIMESTAMPTZ DEFAULT now(),
  deliver_at TIMESTAMPTZ NOT NULL,          -- random 18-24h from creation
  delivered_at TIMESTAMPTZ DEFAULT NULL,     -- when actually delivered
  status TEXT DEFAULT 'pending',             -- pending | delivered | viewed
  
  -- Email tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ DEFAULT NULL,
  
  -- Admin override
  admin_delivered BOOLEAN DEFAULT false      -- true if manually delivered by admin
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_pa_email ON pending_assessments(user_email);
CREATE INDEX IF NOT EXISTS idx_pa_status ON pending_assessments(status);
CREATE INDEX IF NOT EXISTS idx_pa_deliver ON pending_assessments(deliver_at) WHERE status = 'pending';

-- RLS: Users can only read their own assessments
ALTER TABLE pending_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own assessments" ON pending_assessments
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Service role can do everything (edge functions use service key)
