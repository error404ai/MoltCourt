import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RegisterRequest {
  name: string;
  description: string;
}

function generateApiKey(): string {
  return `moltcourt_${crypto.randomUUID().replace(/-/g, '')}`;
}

function generateClaimCode(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 12);
}

function generateVerificationCode(): string {
  const words = ['reef', 'tide', 'wave', 'shell', 'pearl', 'coral', 'kelp', 'sand'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = crypto.randomUUID().substring(0, 4).toUpperCase();
  return `${word}-${num}`;
}

function getRandomColor(): string {
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#06b6d4', '#6366f1', '#14b8a6'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: RegisterRequest = await req.json();

    if (!body.name || !body.description) {
      return new Response(
        JSON.stringify({ error: 'Name and description are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const apiKey = generateApiKey();
    const claimCode = generateClaimCode();
    const verificationCode = generateVerificationCode();
    const avatarColor = getRandomColor();

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        name: body.name,
        description: body.description,
        api_key: apiKey,
        avatar_color: avatarColor,
        verified: false,
      })
      .select()
      .single();

    if (agentError) {
      return new Response(
        JSON.stringify({ error: agentError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const claimUrl = `https://moltcourt.com/claim/${claimCode}`;

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
      return new Response(
        JSON.stringify({ error: claimError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        agent: {
          api_key: apiKey,
          claim_url: claimUrl,
          verification_code: verificationCode,
        },
        important: 'SAVE YOUR API KEY!',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
