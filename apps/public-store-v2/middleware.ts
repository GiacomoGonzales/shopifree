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
		const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
		const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
		if (!projectId || !apiKey) return null;

		const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;

		async function run(fieldPath: string): Promise<{ subdomain?: string; slug?: string } | null> {
			const body = {
				structuredQuery: {
					from: [{ collectionId: "stores" }],
					where: {
						fieldFilter: {
							field: { fieldPath },
							op: "EQUAL",
							value: { stringValue: host }
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

		// Intentar con los dos posibles esquemas
		const first = await run('advanced.customDomain.domain');
		if (first?.subdomain || first?.slug) return first.subdomain || first.slug || null;
		const legacy = await run('settings.domain.customDomain');
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

		// Construir ruta canónica deseada
		let targetSegments = [...segments];

		// Insertar subdominio si existe en host y no está en la ruta
		if (subdomain && subdomain !== 'localhost' && !hasSubdomainInPath) {
			const rest = hasLocale ? segments.slice(1) : segments;
			const restSansDup = rest.filter((seg) => seg !== subdomain);
			targetSegments = [currentLocale || '', subdomain, ...restSansDup].filter(Boolean) as string[];
		}

		// Asegurar locale
		const ensureHasLocale = hasLocale || !subdomain ? hasLocale : false;
		if (!ensureHasLocale) {
			const preferred = getPreferredLocale(req, subdomain || '');
			if (targetSegments.length === 0) {
				targetSegments = [preferred];
			} else if (supportedLocales.includes(targetSegments[0] as any)) {
				// ya tiene locale
			} else {
				targetSegments = [preferred, ...targetSegments];
			}
		}

		const targetPathname = '/' + targetSegments.join('/');
		if (targetPathname !== originalPathname) {
			const to = new URL(targetPathname + search, req.url);
			return NextResponse.redirect(to);
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


