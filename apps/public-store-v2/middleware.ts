import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { isValidLocale, extractLocaleFromPath, buildNormalizedUrl } from "./lib/locale-validation";

const supportedLocales = ["es", "en"] as const;

const intl = createMiddleware({
	locales: Array.from(supportedLocales),
	defaultLocale: "es"
});

function getCookie(req: NextRequest, name: string): string | null {
	try {
		const cookie = req.headers.get('cookie') || '';
		const match = cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
		return match ? decodeURIComponent(match[1]) : null;
	} catch {
		return null;
	}
}

function getPreferredLocale(req: NextRequest, subdomain: string): (typeof supportedLocales)[number] {
	const cookieName = `sf:locale:${subdomain}`;
	const fromCookie = getCookie(req, cookieName);
	if (fromCookie === 'en' || fromCookie === 'es') return fromCookie as any;
	return 'es';
}

function normalizeHost(headerHost: string | null): string {
	let host = (headerHost || '').toLowerCase();
	if (!host) return '';
	// Remover puerto si existe
	const idx = host.indexOf(':');
	if (idx !== -1) host = host.slice(0, idx);
	return host;
}

async function findSubdomainForCustomHost(host: string): Promise<string | null> {
	try {
		const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT;
		const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
		if (!projectId || !apiKey) return null;

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

			if (!res.ok) return null;
			const data = await res.json();
			if (!Array.isArray(data)) return null;

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
						
						if (customDomain && customDomain.toLowerCase() === domainValue.toLowerCase()) {
							return subdomain;
						}
					}
				} catch (e) {
					// Si el documento no existe, continuar con la siguiente tienda
					continue;
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

		// Buscar el dominio en la subcolección settings/domain
		for (const candidate of hostCandidates) {
			const result = await searchDomainSettings(candidate);
			if (result) return result;
		}

		return null;
	} catch (error) {
		console.error('Error in findSubdomainForCustomHost:', error);
		return null;
	}
}

export async function middleware(req: NextRequest) {
	const { nextUrl } = req;
	
	// Add noindex header to API routes
	if (nextUrl.pathname.startsWith('/api')) {
		const response = NextResponse.next();
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
		return response;
	}
	const originalPathname = nextUrl.pathname;
	const search = nextUrl.search;

	// Host desde cabecera (más fiable detrás de proxies)
	let host = normalizeHost(req.headers.get('host'));
	if (!host) return intl(req);

	// 🔒 VALIDAR LOCALE - Bloquear URLs infinitas por locales inválidos
	const localeValidation = extractLocaleFromPath(originalPathname);
	if (localeValidation.locale && !localeValidation.isValid) {
		// Locale inválido detectado: redirigir 308 a /es/...
		const normalizedUrl = buildNormalizedUrl(
			`${nextUrl.protocol}//${host}`,
			'es',
			localeValidation.pathWithoutLocale,
			search
		);
		console.log(`🔒 [Locale Block] ${originalPathname} → ${normalizedUrl} (invalid locale: ${localeValidation.locale})`);
		return NextResponse.redirect(normalizedUrl, 308);
	}

	// 🔄 REDIRECCIONES 301 (host policy)
	const protocol = req.headers.get('x-forwarded-proto') || nextUrl.protocol.slice(0, -1);
	
	// 1. http → https
	if (protocol === 'http' && process.env.NODE_ENV === 'production') {
		const httpsUrl = new URL(req.url);
		httpsUrl.protocol = 'https:';
		return NextResponse.redirect(httpsUrl, 301);
	}
	
	// 2. www → apex
	if (host.startsWith('www.')) {
		const apexHost = host.slice(4);
		const apexUrl = new URL(req.url);
		apexUrl.hostname = apexHost;
		return NextResponse.redirect(apexUrl, 301);
	}
	
	// 3. *.shopifree.app → custom domain (solo en producción)
	if (host.endsWith('shopifree.app') && host !== 'shopifree.app' && process.env.NODE_ENV === 'production') {
		const subdomain = host.split('.')[0];
		
		// Verificar si esta tienda tiene dominio personalizado configurado
		try {
			const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT;
			const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
			
			if (projectId && apiKey && subdomain === 'lunara') { // Solo para Lunara por ahora
				const domainRes = await fetch(
					`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/J0YnmGq3CvniogUb6BPp/settings/domain?key=${apiKey}`
				);
				
				if (domainRes.ok) {
					const domainDoc = await domainRes.json();
					const customDomain = domainDoc?.fields?.customDomain?.stringValue;
					const status = domainDoc?.fields?.status?.stringValue;
					
					if (customDomain && status === 'connected') {
						// Redirigir a dominio personalizado
						const customUrl = new URL(req.url);
						customUrl.hostname = customDomain;
						console.log(`🔄 [Redirect] ${host} → ${customDomain}`);
						return NextResponse.redirect(customUrl, 301);
					}
				}
			}
		} catch (error) {
			console.error('Error verificando dominio personalizado para redirect:', error);
		}
	}

	// (www redirect ya manejado arriba)

	// Dominios de la plataforma (*.shopifree.app, *.localhost)
	const isPlatformDomain = host.endsWith('shopifree.app') || host.endsWith('localhost');

	if (isPlatformDomain) {
		// Subdominio por host
		const subdomain = host.includes('.') ? host.split('.')[0] : '';

		// Partes de la ruta
		const segments = originalPathname.split('/').filter(Boolean);
		const first = segments[0] || '';
		const hasLocale = supportedLocales.includes(first as any);
		const currentLocale = hasLocale ? (first as typeof supportedLocales[number]) : null;
		const hasSubdomainInPath = subdomain && segments[hasLocale ? 1 : 0] === subdomain;

		// Si hay subdominio en la URL pero tenemos subdominio en el host, hacer redirect sin el subdominio
		if (subdomain && subdomain !== 'localhost' && hasSubdomainInPath) {
			const rest = hasLocale ? segments.slice(2) : segments.slice(1); // Remover subdominio de la ruta
			const preferred = hasLocale ? currentLocale : getPreferredLocale(req, subdomain);
			const cleanSegments = [preferred, ...rest].filter(Boolean);
			const cleanPathname = cleanSegments.length > 0 ? '/' + cleanSegments.join('/') : `/${preferred || 'es'}`;
			
			if (cleanPathname !== originalPathname) {
				const to = new URL(cleanPathname + search, req.url);
				return NextResponse.redirect(to, 301);
			}
		}

		// Asegurar que tengamos locale si no lo tiene
		if (!hasLocale) {
			const preferred = getPreferredLocale(req, subdomain || '');
			const targetPathname = `/${preferred}${originalPathname === '/' ? '' : originalPathname}`;
			if (targetPathname !== originalPathname) {
				const to = new URL(targetPathname + search, req.url);
				return NextResponse.redirect(to);
			}
		}

		// Para rewrite interno, necesitamos agregar el subdominio para que Next.js encuentre la ruta correcta
		if (subdomain && subdomain !== 'localhost') {
			const currentSegments = originalPathname.split('/').filter(Boolean);
			const locale = currentSegments[0] && supportedLocales.includes(currentSegments[0] as any) ? currentSegments[0] : 'es';
			const pathAfterLocale = currentSegments.slice(supportedLocales.includes(currentSegments[0] as any) ? 1 : 0);
			
			// Solo hacer rewrite interno si no contiene ya el subdominio
			if (!pathAfterLocale.includes(subdomain)) {
				const internalSegments = [locale, subdomain, ...pathAfterLocale];
				const internalPathname = '/' + internalSegments.join('/');
				return NextResponse.rewrite(new URL(internalPathname + search, req.url));
			}
		}

		// Si no hubo cambios, delegar a next-intl
		return intl(req);
	}

	// Dominio personalizado: resolver a subdominio y reescribir sin cambiar URL pública
	const resolvedSubdomain = await findSubdomainForCustomHost(host);
	if (!resolvedSubdomain) {
		return NextResponse.rewrite(new URL('/not-found', req.url));
	}

	const segments = originalPathname.split('/').filter(Boolean);
	const first = segments[0] || '';
	const hasLocale = supportedLocales.includes(first as any);
	
	// Si la URL ya contiene el subdominio después del locale, NO hacer rewrite para evitar loops
	const localeIndex = hasLocale ? 1 : 0;
	if (segments[localeIndex] === resolvedSubdomain) {
		// La URL ya tiene el formato correcto, delegar a next-intl
		return intl(req);
	}
	
	const preferred = hasLocale ? (first as typeof supportedLocales[number]) : getPreferredLocale(req, resolvedSubdomain);
	const rest = hasLocale ? segments.slice(1) : segments;
	const targetSegments = [preferred, resolvedSubdomain, ...rest];
	const internalPathname = '/' + targetSegments.join('/');
	
	return NextResponse.rewrite(new URL(internalPathname + search, req.url));
}

export const config = {
  matcher: [
    // Excluir: /_next/*, /api/*, /robots.txt, */sitemap*.xml, google*.html, archivos estáticos
    "/((?!_next|api|robots\\.txt|.*sitemap.*\\.xml|google.*\\.html|favicon|.*\\..*).*)"
  ]
};


