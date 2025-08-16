export const dynamic = "force-dynamic";

async function findSubdomainForCustomHost(host: string): Promise<{subdomain: string | null, debug: any[]}> {
	const debug: any[] = [];
	try {
		const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT;
		const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
		
		debug.push({ projectId: !!projectId, apiKey: !!apiKey });
		
		if (!projectId || !apiKey) return { subdomain: null, debug };

		const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;

		// Buscar en todas las tiendas y luego verificar sus configuraciones de dominio
		async function searchDomainSettings(domainValue: string): Promise<string | null> {
			// Primero obtener todas las tiendas
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

			debug.push({ storesQueryStatus: res.status, storesQueryOk: res.ok });

			if (!res.ok) return null;
			const data = await res.json();
			if (!Array.isArray(data)) return null;

			debug.push({ totalStores: data.length });

			// Para cada tienda, verificar si tiene el dominio personalizado configurado
			for (const row of data) {
				const docPath = row?.document?.name;
				if (!docPath) continue;
				
				// Extraer el storeId
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
						
						debug.push({ 
							storeId, 
							subdomain, 
							customDomain,
							domainMatch: customDomain?.toLowerCase() === domainValue.toLowerCase()
						});
						
						if (customDomain && customDomain.toLowerCase() === domainValue.toLowerCase()) {
							return subdomain;
						}
					} else {
						debug.push({ 
							storeId, 
							subdomain, 
							domainDocStatus: domainDocRes.status,
							message: 'No domain config found'
						});
					}
				} catch (e) {
					debug.push({ 
						storeId, 
						subdomain, 
						error: e instanceof Error ? e.message : String(e)
					});
				}
			}
			return null;
		}

		// Preparar variantes del dominio
		const bare = host.toLowerCase();
		const withWww = bare.startsWith('www.') ? bare : `www.${bare}`;
		const withoutWww = bare.replace(/^www\./, '');
		const hostCandidates = Array.from(new Set([
			bare,
			withoutWww,
			withWww
		]));

		debug.push({ hostCandidates });

		// Buscar el dominio en la subcolección settings/domain
		for (const candidate of hostCandidates) {
			const result = await searchDomainSettings(candidate);
			if (result) return { subdomain: result, debug };
		}

		return { subdomain: null, debug };
	} catch (error) {
		debug.push({ 
			error: error instanceof Error ? error.message : String(error) 
		});
		return { subdomain: null, debug };
	}
}

export async function GET(req: Request) {
	const url = new URL(req.url);
	const domain = url.searchParams.get('domain') || 'lunara-store.xyz';
	
	const result = await findSubdomainForCustomHost(domain);
	
	return new Response(JSON.stringify(result, null, 2), {
		headers: { 'Content-Type': 'application/json' }
	});
}
