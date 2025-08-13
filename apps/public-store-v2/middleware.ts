import { NextResponse, NextRequest } from "next/server";

const IGNORED_PATHS = [
	"/_next",
	"/api",
	"/robots.txt",
	"/sitemap.xml",
	"/healthz",
	"/favicon.ico"
];

export function middleware(req: NextRequest) {
	const { nextUrl } = req;
	const { pathname, hostname, search } = nextUrl;

    // Ignorar rutas especiales y archivos estáticos (con extensión)
    if (IGNORED_PATHS.some((p) => pathname.startsWith(p)) || pathname.includes(".")) {
		return NextResponse.next();
	}

	// Ej: lunara.localhost -> subdomain: lunara
    let subdomain = "";
    let host = hostname.toLowerCase();
    // Quitar prefijo www.
    if (host.startsWith("www.")) {
        host = host.slice(4);
    }
	// Manejo simple: subdominio es la primera parte antes del primer punto
	if (host.includes(".")) {
		subdomain = host.split(".")[0];
	}

	// Si no hay subdominio, no reescribir
	if (!subdomain || subdomain === "localhost") {
		return NextResponse.next();
	}

	const rewriteUrl = new URL(`/${subdomain}${pathname}${search}`, req.url);
	return NextResponse.rewrite(rewriteUrl);
}

export const config = {
	matcher: "/:path*"
};


