import { NextRequest } from 'next/server';
import { resolveStoreFromRequest } from '../../lib/resolve-store';
import { getStoreMetadata } from '../../server-only/store-metadata';
import { extractGoogleVerificationToken, isValidGoogleToken, generateGoogleVerificationHTML } from '../../lib/google-verification';

/**
 * Route Handler para archivos de verificación de Google Search Console
 * Maneja URLs como: google[TOKEN].html
 * 
 * Solo sirve el archivo si:
 * 1. El token en la URL coincide con el configurado en la tienda
 * 2. El token es válido
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { verification?: string } }
) {
  try {
    // Extraer token de la URL (sin 'google' prefix y '.html' suffix)
    const urlToken = params?.verification;
    
    if (!urlToken) {
      return new Response('Not Found', { status: 404 });
    }
    
    // Resolver tienda desde request
    const resolved = await resolveStoreFromRequest(request, {});
    const { storeSubdomain } = resolved;
    
    if (!storeSubdomain) {
      return new Response('Not Found', { status: 404 });
    }

    // Obtener configuración de la tienda
    const storeData = await getStoreMetadata(storeSubdomain);
    const configuredToken = extractGoogleVerificationToken(storeData?.googleSearchConsole);
    
    // Validar que:
    // 1. Hay un token configurado válido
    // 2. El token de la URL coincide con el configurado
    if (!isValidGoogleToken(configuredToken) || urlToken !== configuredToken) {
      return new Response('Not Found', { status: 404 });
    }

    // Generar contenido del archivo de verificación
    const htmlContent = generateGoogleVerificationHTML(configuredToken);

    console.log('📄 [Google Verification] Sirviendo archivo:', {
      storeSubdomain,
      filename: `google${urlToken}.html`,
      hasValidToken: true
    });

    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400' // Cache 1 día
      }
    });

  } catch (error) {
    console.error('Error sirviendo archivo de verificación de Google:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
