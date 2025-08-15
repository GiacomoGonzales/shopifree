import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

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

		async function run(fieldPath: string, value: string): Promise<{ subdomain?: string; slug?: string } | null> {
			const body = {
				structuredQuery: {
					from: [{ collectionId: "stores" }],
					where: {
						fieldFilter: {
							field: { fieldPath },
							op: "EQUAL",
							value: { stringValue: value }
						}
					},
					limit: 1
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
			for (const row of data) {
				const fields = row?.document?.fields;
				if (!fields) continue;
				const sub = fields?.subdomain?.stringValue || undefined;
				const slug = fields?.slug?.stringValue || undefined;
				if (sub || slug) return { subdomain: sub, slug };
			}
			return null;
		}

		// Intentar con valores de host en distintas variantes (por si fue guardado con protocolo o www)
		const bare = host.toLowerCase();
		const withWww = bare.startsWith('www.') ? bare : `www.${bare}`;
		const withoutWww = bare.replace(/^www\./, '');
		const hostCandidates = Array.from(new Set([
			bare,
			withoutWww,
			withWww,
			`https://${bare}`,
			`http://${bare}`,
			`https://${withWww}`,
			`http://${withWww}`
		]));

		// Intentar con los dos posibles esquemas
		let first: { subdomain?: string; slug?: string } | null = null;
		for (const candidate of hostCandidates) {
			first = await run('advanced.customDomain.domain', candidate);
			if (first?.subdomain || first?.slug) break;
		}
		if (first?.subdomain || first?.slug) return first.subdomain || first.slug || null;
		let legacy: { subdomain?: string; slug?: string } | null = null;
		for (const candidate of hostCandidates) {
			legacy = await run('settings.domain.customDomain', candidate);
			if (legacy?.subdomain || legacy?.slug) break;
		}
		if (legacy?.subdomain || legacy?.slug) return legacy.subdomain || legacy.slug || null;
		return null;
	} catch {
		return null;
	}
}

export async function middleware(req: NextRequest) {
	const { nextUrl } = req;
	const originalPathname = nextUrl.pathname;
	const search = nextUrl.search;

	// Host desde cabecera (más fiable detrás de proxies)
	let host = normalizeHost(req.headers.get('host'));
	if (!host) return intl(req);

	// Redirigir www. -> raíz (301)
	if (host.startsWith('www.')) {
		const bare = host.slice(4);
		const to = new URL(nextUrl);
		to.host = bare;
		return NextResponse.redirect(to, 301);
	}

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
	const preferred = hasLocale ? (first as typeof supportedLocales[number]) : getPreferredLocale(req, resolvedSubdomain);
	const rest = hasLocale ? segments.slice(1) : segments;
	const targetSegments = [preferred, resolvedSubdomain, ...rest];
	const internalPathname = '/' + targetSegments.join('/');
	return NextResponse.rewrite(new URL(internalPathname + search, req.url));
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};


