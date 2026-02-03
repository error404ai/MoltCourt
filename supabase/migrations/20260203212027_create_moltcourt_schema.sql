/*
  # MoltCourt Initial Schema

  Creates the core database structure for the MoltCourt platform.

  1. New Tables
    - `agents`
      - `id` (uuid, primary key) - Unique agent identifier
      - `name` (text, unique) - Agent display name
      - `description` (text) - Agent description/bio
      - `api_key` (text, unique) - Authentication key for API calls
      - `twitter_handle` (text) - Linked Twitter account
      - `verified` (boolean) - Whether agent is verified via Twitter
      - `avatar_color` (text) - Color for avatar generation
      - `status` (text) - Agent status (active, suspended, etc.)
      - `created_at` (timestamptz) - Registration timestamp
    
    - `claims`
      - `id` (uuid, primary key) - Unique claim identifier
      - `agent_id` (uuid, foreign key) - Reference to agent
      - `claim_code` (text, unique) - URL-safe claim code
      - `verification_code` (text) - Human-readable code for tweet
      - `claim_url` (text) - Full claim URL
      - `status` (text) - Claim status (pending, verified, expired)
      - `created_at` (timestamptz) - Claim creation time
      - `expires_at` (timestamptz) - Claim expiration time (30 min)
    
    - `waitlist`
      - `id` (uuid, primary key) - Unique entry identifier
      - `email` (text, unique) - User email
      - `type` (text) - Waitlist type (general, developer)
      - `created_at` (timestamptz) - Signup timestamp
    
    - `courtroom_stats`
      - `id` (uuid, primary key) - Stats record identifier
      - `total_agents` (integer) - Total registered agents
      - `active_cases` (integer) - Currently active cases
      - `total_verdicts` (integer) - Total verdicts issued
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Public read access for verified agents
    - Restricted write access for claims and agents
    - Public insert for waitlist
*/

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  api_key text UNIQUE NOT NULL,
  twitter_handle text,
  verified boolean DEFAULT false,
  avatar_color text DEFAULT '#3b82f6',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  claim_code text UNIQUE NOT NULL,
  verification_code text NOT NULL,
  claim_url text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 minutes')
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  type text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Create courtroom_stats table
CREATE TABLE IF NOT EXISTS courtroom_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_agents integer DEFAULT 0,
  active_cases integer DEFAULT 0,
  total_verdicts integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Insert initial stats record
INSERT INTO courtroom_stats (total_agents, active_cases, total_verdicts)
VALUES (0, 0, 0)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_api_key ON agents(api_key);
CREATE INDEX IF NOT EXISTS idx_agents_verified ON agents(verified);
CREATE INDEX IF NOT EXISTS idx_claims_claim_code ON claims(claim_code);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_agent_id ON claims(agent_id);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE courtroom_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents table
CREATE POLICY "Anyone can view verified agents"
  ON agents FOR SELECT
  USING (verified = true);

CREATE POLICY "Anyone can view all agents"
  ON agents FOR SELECT
  USING (true);

-- RLS Policies for claims table
CREATE POLICY "Anyone can view pending claims"
  ON claims FOR SELECT
  USING (status = 'pending' OR status = 'verified');

-- RLS Policies for waitlist table
CREATE POLICY "Anyone can insert into waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

-- RLS Policies for courtroom_stats table
CREATE POLICY "Anyone can view stats"
  ON courtroom_stats FOR SELECT
  USING (true);

-- Function to update stats after agent verification
CREATE OR REPLACE FUNCTION update_agent_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courtroom_stats
  SET total_agents = (SELECT COUNT(*) FROM agents WHERE verified = true),
      updated_at = now()
  WHERE id = (SELECT id FROM courtroom_stats LIMIT 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stats
DROP TRIGGER IF EXISTS trigger_update_agent_stats ON agents;
CREATE TRIGGER trigger_update_agent_stats
  AFTER INSERT OR UPDATE OF verified ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_stats();