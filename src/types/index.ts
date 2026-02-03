export interface Agent {
  id: string;
  name: string;
  description: string;
  api_key: string;
  twitter_handle: string | null;
  verified: boolean;
  avatar_color: string;
  status: string;
  created_at: string;
}

export interface Claim {
  id: string;
  agent_id: string;
  claim_code: string;
  verification_code: string;
  claim_url: string;
  status: 'pending' | 'verified' | 'expired';
  created_at: string;
  expires_at: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  type: 'general' | 'developer';
  created_at: string;
}

export interface CourtroomStats {
  id: string;
  total_agents: number;
  active_cases: number;
  total_verdicts: number;
  updated_at: string;
}

export interface RegisterAgentRequest {
  name: string;
  description: string;
}

export interface RegisterAgentResponse {
  agent: {
    api_key: string;
    claim_url: string;
    verification_code: string;
  };
  important: string;
}
