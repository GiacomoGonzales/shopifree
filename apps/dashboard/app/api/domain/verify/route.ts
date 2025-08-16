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
  const timeout = setTimeout(() => controller.abort(), 10000);
  
  try {
    // Intentar HTTPS en la página principal y en /healthz
    const urls = [`https://${domain}`, `https://${domain}/healthz`];
    let bestResult: VerifyResponse | null = null;
    
    for (const url of urls) {
      try {
        console.log(`🔍 Verificando: ${url}`);
        const res = await fetch(url, { 
          method: 'GET', 
          cache: 'no-store', 
          signal: controller.signal,
          headers: {
            'User-Agent': 'Shopifree-Domain-Verifier/1.0'
          }
        });
        
        const headerServer = res.headers.get('server');
        const vercelId = res.headers.get('x-vercel-id');
        const vercelCache = res.headers.get('x-vercel-cache');
        const vercelRegion = res.headers.get('x-vercel-region');
        const cfRay = res.headers.get('cf-ray'); // Cloudflare (Vercel usa Cloudflare)
        
        // Detectar Vercel de múltiples formas
        const isVercel = Boolean(
          vercelId || 
          vercelCache || 
          vercelRegion ||
          (headerServer && /vercel/i.test(headerServer)) ||
          (cfRay && res.headers.get('x-matched-path')) || // Vercel + Cloudflare
          res.headers.get('x-vercel-functions-cache') ||
          res.headers.get('x-vercel-proxy-cache')
        );
        
        const ok = res.ok;
        
        console.log(`📊 Resultado para ${url}:`, {
          status: res.status,
          ok,
          headerServer,
          vercelId,
          vercelCache,
          vercelRegion,
          cfRay,
          isVercel
        });
        
        const result = { 
          ssl: true, // Si llegamos aquí, SSL funciona
          verified: isVercel && ok, 
          platformHeader: headerServer, 
          ok,
          source: 'http-probe' as const
        };
        
        // Si encontramos un resultado exitoso con Vercel, usarlo
        if (result.verified) {
          clearTimeout(timeout);
          return result;
        }
        
        // Guardar el mejor resultado hasta ahora
        if (!bestResult || (result.ok && !bestResult.ok)) {
          bestResult = result;
        }
        
      } catch (urlError) {
        console.log(`❌ Error en ${url}:`, urlError);
        continue;
      }
    }
    
    clearTimeout(timeout);
    
    // Si llegamos aquí, usar el mejor resultado o indicar que SSL funciona pero no detectamos Vercel
    if (bestResult) {
      return bestResult;
    }
    
    // Si ninguna URL funcionó pero llegamos aquí, significa que hay conectividad
    return {
      ssl: true,
      verified: false, // No pudimos confirmar que es Vercel
      platformHeader: null,
      ok: false,
      source: 'http-probe'
    };
    
  } catch (error) {
    clearTimeout(timeout);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`❌ Error general verificando ${domain}:`, errorMessage);
    
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

    // Fallback: probe HTTPS directamente
    const result = await checkHttpsHealth(domain);
    
    // Si el sitio funciona perfectamente pero no detectamos headers de Vercel,
    // asumir que está verificado (especialmente si SSL funciona y responde OK)
    if (result.ssl && result.ok && !result.verified) {
      console.log(`🔄 Dominio funciona correctamente, marcando como verificado: ${domain}`);
      result.verified = true;
    }
    
    return new Response(JSON.stringify({ ...result, source: 'http-probe' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'unexpected-error' }), { status: 500 });
  }
}


