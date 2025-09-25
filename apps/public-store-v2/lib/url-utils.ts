/**
 * Utilidades para construcción de URLs que respetan la estructura de la tienda
 */

/**
 * Construye URL respetando la estructura de la tienda
 * - Localhost con puerto (ej: localhost:3004): /store-name/path?params
 * - Producción (subdominio/dominio): /path?params
 */
export function buildStoreUrl(path: string, queryParams?: string): string {
    if (typeof window === 'undefined') return path;

    const pathname = window.location.pathname;
    const host = window.location.hostname;
    const port = window.location.port;

    let baseUrl: string;

    // Si estamos en localhost con puerto, incluir el store ID del path actual
    if ((host === 'localhost' || host.endsWith('localhost')) && port) {
        const pathParts = pathname.split('/').filter(part => part.length > 0);

        if (pathParts.length > 0) {
            // El primer segmento es el store ID (ej: "lunara")
            const storeId = pathParts[0];
            baseUrl = `/${storeId}${path}`;
        } else {
            baseUrl = path;
        }
    } else {
        // Producción: subdominio o dominio personalizado
        baseUrl = path;
    }

    // Agregar query parameters si existen
    if (queryParams) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        baseUrl += separator + queryParams;
    }

    console.log('🔗 [buildStoreUrl]', {
        input: path,
        queryParams,
        currentPath: pathname,
        host: `${host}:${port}`,
        result: baseUrl
    });

    return baseUrl;
}