interface CanonicalResult {
  canonicalHost: string;
  isCustomDomain: boolean;
  storeId: string | null;
}

export async function getCanonicalHost(storeSubdomain: string): Promise<CanonicalResult> {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) {
      return {
        canonicalHost: `https://${storeSubdomain}.shopifree.app`,
        isCustomDomain: false,
        storeId: null
      };
    }
    
    // Buscar store por subdomain
    const storeQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "stores" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "subdomain" },
              op: "EQUAL",
              value: { stringValue: storeSubdomain }
            }
          }
        }
      })
    });
    
    if (!storeQuery.ok) throw new Error('Store query failed');
    
    const storeData = await storeQuery.json();
    if (!Array.isArray(storeData) || storeData.length === 0) {
      return {
        canonicalHost: `https://${storeSubdomain}.shopifree.app`,
        isCustomDomain: false,
        storeId: null
      };
    }
    
    const storeDoc = storeData[0]?.document;
    const storeId = storeDoc?.name.split('/').pop() || null;
    
    // Buscar dominio personalizado
    const domainQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/domain?key=${apiKey}`);
    
    if (domainQuery.ok) {
      const domainDoc = await domainQuery.json();
      const customDomain = domainDoc?.fields?.customDomain?.stringValue;
      const status = domainDoc?.fields?.status?.stringValue;
      
      if (customDomain && status === 'connected') {
        return {
          canonicalHost: `https://${customDomain}`,
          isCustomDomain: true,
          storeId
        };
      }
    }
    
    return {
      canonicalHost: `https://${storeSubdomain}.shopifree.app`,
      isCustomDomain: false,
      storeId
    };
    
  } catch (error) {
    console.error('Error resolving canonical host:', error);
    return {
      canonicalHost: `https://${storeSubdomain}.shopifree.app`,
      isCustomDomain: false,
      storeId: null
    };
  }
}

export type { CanonicalResult };
