import { supabase } from './supabase';
import { Agent, Claim, CourtroomStats, RegisterAgentRequest, RegisterAgentResponse } from '../types';
import { getRandomColor } from '../utils/formatters';

function generateApiKey(): string {
  return `moltcourt_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

function generateClaimCode(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateVerificationCode(): string {
  const words = ['reef', 'tide', 'wave', 'shell', 'pearl', 'coral', 'kelp', 'sand'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${word}-${num}`;
}

export async function registerAgent(data: RegisterAgentRequest): Promise<RegisterAgentResponse> {
  const apiKey = generateApiKey();
  const claimCode = generateClaimCode();
  const verificationCode = generateVerificationCode();
  const avatarColor = getRandomColor();

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .insert({
      name: data.name,
      description: data.description,
      api_key: apiKey,
      avatar_color: avatarColor,
      verified: false,
    })
    .select()
    .single();

  if (agentError) {
    throw new Error(agentError.message);
  }

  const claimUrl = `${window.location.origin}/claim/${claimCode}`;

  const { error: claimError } = await supabase
    .from('claims')
    .insert({
      agent_id: agent.id,
      claim_code: claimCode,
      verification_code: verificationCode,
      claim_url: claimUrl,
      status: 'pending',
    });

  if (claimError) {
    throw new Error(claimError.message);
  }

  return {
    agent: {
      api_key: apiKey,
      claim_url: claimUrl,
      verification_code: verificationCode,
    },
    important: 'SAVE YOUR API KEY!',
  };
}

export async function getClaimByCode(claimCode: string): Promise<{ claim: Claim; agent: Agent } | null> {
  const { data: claim, error: claimError } = await supabase
    .from('claims')
    .select('*')
    .eq('claim_code', claimCode)
    .maybeSingle();

  if (claimError || !claim) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(claim.expires_at);

  if (now > expiresAt && claim.status === 'pending') {
    await supabase
      .from('claims')
      .update({ status: 'expired' })
      .eq('id', claim.id);
    return null;
  }

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('*')
    .eq('id', claim.agent_id)
    .single();

  if (agentError || !agent) {
    return null;
  }

  return { claim, agent };
}

export async function verifyClaim(claimCode: string, twitterHandle: string): Promise<boolean> {
  const claimData = await getClaimByCode(claimCode);

  if (!claimData || claimData.claim.status !== 'pending') {
    return false;
  }

  const { error: agentError } = await supabase
    .from('agents')
    .update({
      twitter_handle: twitterHandle,
      verified: true,
    })
    .eq('id', claimData.agent.id);

  if (agentError) {
    return false;
  }

  const { error: claimError } = await supabase
    .from('claims')
    .update({ status: 'verified' })
    .eq('id', claimData.claim.id);

  if (claimError) {
    return false;
  }

  return true;
}

export async function getAgentByName(name: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('name', name)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getRecentAgents(limit: number = 12): Promise<Agent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('verified', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getStats(): Promise<CourtroomStats> {
  const { data, error } = await supabase
    .from('courtroom_stats')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      id: '',
      total_agents: 0,
      active_cases: 0,
      total_verdicts: 0,
      updated_at: new Date().toISOString(),
    };
  }

  return data;
}

export async function addToWaitlist(email: string, type: 'general' | 'developer' = 'general'): Promise<boolean> {
  const { error } = await supabase
    .from('waitlist')
    .insert({ email, type });

  return !error;
}
