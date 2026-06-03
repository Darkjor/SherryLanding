// ============================================================================
// Sherry Studio — Edge Function: publish
//
// Dispara un workflow_dispatch de GitHub Actions para reconstruir el sitio
// estático tras editar contenido en el admin.
//
// SEGURIDAD:
//  - Solo usuarios autenticados (JWT de Supabase válido) pueden invocarla.
//  - El GITHUB_TOKEN vive como secreto de Supabase (Deno.env). NUNCA en el
//    frontend ni commiteado.
//
// Secretos esperados (supabase secrets set ...):
//   GITHUB_TOKEN  — PAT fine-grained con permiso Actions: write en el repo.
//   GITHUB_REPO   — 'owner/repo', p.ej. 'Darkjor/SherryLanding'.
//   SUPABASE_URL       — (lo inyecta Supabase automáticamente).
//   SUPABASE_ANON_KEY  — (lo inyecta Supabase automáticamente).
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://darkjor.github.io',
  'http://localhost:4321',
  'http://localhost:3000',
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin');

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405, origin);
  }

  // 1) Verificar JWT de Supabase del que llama.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return json({ ok: false, error: 'Missing Authorization bearer token' }, 401, origin);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ ok: false, error: 'Server misconfigured: missing Supabase env' }, 500, origin);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return json({ ok: false, error: 'Unauthorized' }, 401, origin);
  }

  // 2) Validar secretos de GitHub.
  const githubToken = Deno.env.get('GITHUB_TOKEN');
  const githubRepo = Deno.env.get('GITHUB_REPO'); // 'owner/repo'
  if (!githubToken || !githubRepo) {
    return json({ ok: false, error: 'Server misconfigured: missing GitHub env' }, 500, origin);
  }

  // 3) Disparar el workflow_dispatch.
  const url = `https://api.github.com/repos/${githubRepo}/actions/workflows/deploy.yml/dispatches`;
  const ghResp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'sherry-studio-publish',
    },
    body: JSON.stringify({ ref: 'main' }),
  });

  // GitHub responde 204 No Content en éxito.
  if (ghResp.status !== 204) {
    const detail = await ghResp.text();
    return json(
      { ok: false, error: `GitHub dispatch failed (${ghResp.status})`, detail },
      502,
      origin,
    );
  }

  return json({ ok: true }, 200, origin);
});
