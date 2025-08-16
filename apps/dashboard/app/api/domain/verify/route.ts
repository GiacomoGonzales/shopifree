export const dynamic = "force-dynamic";

type VerifyResponse = {
  ssl: boolean;
  verified: boolean;
  platformHeader?: string | null;
  ok: boolean;
  source?: 'http-probe' | 'vercel-api';
  error?: string;
};

async function checkHttpsHealth(domain: string): Promise<VerifyResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // Aumentar timeout
  try {
    // Primero intentar HTTPS
    const url = `https://${domain}/healthz`;
    const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal });
    clearTimeout(timeout);
    
    const headerServer = res.headers.get('server');
    const vercelId = res.headers.get('x-vercel-id');
    const vercelCache = res.headers.get('x-vercel-cache');
    const isVercel = Boolean(vercelId || vercelCache || (headerServer && /vercel/i.test(headerServer)));
    const ok = res.ok;
    
    // Si llegamos aquí y no hubo error, significa que SSL funciona
    return { 
      ssl: true, // Si no hubo error de conexión SSL, está funcionando
      verified: isVercel && ok, 
      platformHeader: headerServer, 
      ok,
      source: 'http-probe'
    };
  } catch (error) {
    clearTimeout(timeout);
    
    // Intentar verificar si es un error SSL específico o conexión general
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isSslError = errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('TLS');
    
    return { 
      ssl: false, 
      verified: false, 
      platformHeader: null, 
      ok: false,
      source: 'http-probe',
      error: errorMessage
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const domain: string = (body?.domain || '').toString().trim();
    if (!domain) {
      return new Response(JSON.stringify({ error: 'domain-required' }), { status: 400 });
    }

    // Si hay VERCEL_API_TOKEN, intentar obtener estado real desde Vercel API
    const vercelToken = process.env.VERCEL_API_TOKEN || process.env.NEXT_PUBLIC_VERCEL_API_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID || process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID || undefined;
    if (vercelToken && vercelProjectId) {
      try {
        const apiUrl = `https://api.vercel.com/v10/projects/${vercelProjectId}/domains`;
        const apiRes = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${vercelToken}` },
          cache: 'no-store'
        });
        if (apiRes.ok) {
          const json = await apiRes.json();
          const item = Array.isArray(json?.domains) ? json.domains.find((d: any) => (d?.name || '').toLowerCase() === domain.toLowerCase()) : null;
          if (item) {
            const sslReady = Boolean(item?.https?.cert?.autoRenew || item?.https?.cert?.daysUntilExpiry >= 0 || item?.https?.enabled || item?.verified);
            const verified = Boolean(item?.verified);
            return new Response(
              JSON.stringify({ ssl: sslReady, verified, ok: true, source: 'vercel-api' }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch {}
    }

    // Fallback: probe HTTPs directamente
    const result = await checkHttpsHealth(domain);
    return new Response(JSON.stringify({ ...result, source: 'http-probe' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'unexpected-error' }), { status: 500 });
  }
}


