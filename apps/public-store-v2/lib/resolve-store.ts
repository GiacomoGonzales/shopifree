export interface ResolvedStore {
  storeId: string | null;
  storeSubdomain: string | null;
  canonicalHost: string;
  isCustomDomain: boolean;
}

export async function resolveStoreFromRequest(
  request: Request, 
  params: { storeSubdomain?: string; locale?: string }
): Promise<ResolvedStore> {
  const requestUrl = new URL(request.url);
  const hostname = requestUrl.hostname;
  let canonicalHost = `${requestUrl.protocol}//${hostname}`;
  let isCustomDomain = false;

  // Si params.storeSubdomain existe, úsalo
  if (params.storeSubdomain) {
    console.log('🏪 [ResolveStore] Usando storeSubdomain de params:', params.storeSubdomain);
    
    // Para subdominios de plataforma, el storeId necesita ser buscado
    try {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT;
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
      
      if (projectId && apiKey) {
        const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
        const body = {
          structuredQuery: {
            from: [{ collectionId: "stores" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "subdomain" },
                op: "EQUAL",
                value: { stringValue: params.storeSubdomain }
              }
            }
          }
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const docPath = data[0]?.document?.name;
            if (docPath) {
              const pathParts = docPath.split('/');
              const storeIndex = pathParts.indexOf('stores');
              if (storeIndex !== -1 && storeIndex + 1 < pathParts.length) {
                const storeId = pathParts[storeIndex + 1];
                
                // Para subdominios de plataforma, verificar si tienen dominio personalizado configurado
                try {
                  const domainDocRes = await fetch(
                    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/domain?key=${apiKey}`
                  );
                  
                  if (domainDocRes.ok) {
                    const domainDoc = await domainDocRes.json();
                    const customDomain = domainDoc?.fields?.customDomain?.stringValue;
                    const status = domainDoc?.fields?.status?.stringValue;
                    
                    if (customDomain && status === 'connected') {
                      // Esta tienda tiene dominio personalizado configurado y conectado
                      canonicalHost = `https://${customDomain}`;
                      isCustomDomain = true;
                    } else {
                      // No tiene dominio personalizado: usar subdominio de plataforma
                      canonicalHost = `https://${params.storeSubdomain}.shopifree.app`;
                      isCustomDomain = false;
                    }
                  } else {
                    // No se pudo obtener configuración de dominio: usar subdominio de plataforma
                    canonicalHost = `https://${params.storeSubdomain}.shopifree.app`;
                    isCustomDomain = false;
                  }
                } catch (e) {
                  console.error('Error verificando dominio personalizado:', e);
                  // Fallback: usar subdominio de plataforma
                  canonicalHost = `https://${params.storeSubdomain}.shopifree.app`;
                  isCustomDomain = false;
                }
                
                console.log('✅ [ResolveStore] StoreId encontrado por subdomain:', { 
                  storeId, 
                  storeSubdomain: params.storeSubdomain, 
                  canonicalHost, 
                  isCustomDomain 
                });
                return { storeId, storeSubdomain: params.storeSubdomain, canonicalHost, isCustomDomain };
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [ResolveStore] Error buscando por subdomain:', error);
    }
    
    return { storeId: null, storeSubdomain: params.storeSubdomain, canonicalHost, isCustomDomain: false };
  }

  // Si no, obtener el host del request y mapearlo a la tienda
  console.log('🌐 [ResolveStore] Buscando por dominio personalizado:', hostname);
  
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) {
      console.log('❌ [ResolveStore] Faltan credenciales de Firebase');
      return { storeId: null, storeSubdomain: null, canonicalHost, isCustomDomain: false };
    }

    const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
    
    // Obtener todas las tiendas
    const body = {
      structuredQuery: {
        from: [{ collectionId: "stores" }]
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Para cada tienda, verificar si tiene el dominio personalizado configurado
        for (const row of data) {
          const docPath = row?.document?.name;
          if (!docPath) continue;
          
          // Extraer el storeId y subdomain
          const pathParts = docPath.split('/');
          const storeIndex = pathParts.indexOf('stores');
          if (storeIndex === -1 || storeIndex + 1 >= pathParts.length) continue;
          
          const storeId = pathParts[storeIndex + 1];
          const subdomain = row?.document?.fields?.subdomain?.stringValue;
          
          if (!subdomain) continue;

          // Verificar si esta tienda tiene el dominio personalizado configurado
          try {
            const domainDocRes = await fetch(
              `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/domain?key=${apiKey}`
            );
            
            if (domainDocRes.ok) {
              const domainDoc = await domainDocRes.json();
              const customDomain = domainDoc?.fields?.customDomain?.stringValue;
              
              if (customDomain && customDomain.toLowerCase() === hostname.toLowerCase()) {
                console.log('✅ [ResolveStore] StoreId encontrado por dominio personalizado:', { storeId, storeSubdomain: subdomain, hostname });
                return { storeId, storeSubdomain: subdomain, canonicalHost, isCustomDomain: true };
              }
            }
          } catch (e) {
            // Si el documento no existe, continuar con la siguiente tienda
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ [ResolveStore] Error buscando por dominio personalizado:', error);
  }
  
  console.log('❌ [ResolveStore] No se encontró tienda para hostname:', hostname);
  return { storeId: null, storeSubdomain: null, canonicalHost, isCustomDomain: false };
}
