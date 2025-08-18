/**
 * Validación y normalización de locales
 * Previene URLs infinitas por locales inválidos
 */

export const VALID_LOCALES = ['es', 'en'] as const;
export type ValidLocale = typeof VALID_LOCALES[number];

/**
 * Verifica si un string es un locale válido
 */
export function isValidLocale(locale: string): locale is ValidLocale {
  return VALID_LOCALES.includes(locale as ValidLocale);
}

/**
 * Normaliza un locale a uno válido, defaulteando a 'es'
 */
export function normalizeLocale(locale: string): ValidLocale {
  return isValidLocale(locale) ? locale : 'es';
}

/**
 * Extrae y valida el locale del primer segmento de una URL
 */
export function extractLocaleFromPath(pathname: string): {
  locale: string | null;
  isValid: boolean;
  normalizedLocale: ValidLocale;
  pathWithoutLocale: string;
} {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] || '';
  
  if (isValidLocale(firstSegment)) {
    return {
      locale: firstSegment,
      isValid: true,
      normalizedLocale: firstSegment,
      pathWithoutLocale: '/' + segments.slice(1).join('/')
    };
  }
  
  return {
    locale: firstSegment || null,
    isValid: false,
    normalizedLocale: 'es',
    pathWithoutLocale: pathname
  };
}

/**
 * Construye una URL normalizada con locale válido
 */
export function buildNormalizedUrl(
  baseUrl: string, 
  locale: ValidLocale, 
  pathWithoutLocale: string,
  search?: string
): string {
  const cleanPath = pathWithoutLocale.startsWith('/') ? pathWithoutLocale.slice(1) : pathWithoutLocale;
  const normalizedPath = `/${locale}${cleanPath ? '/' + cleanPath : ''}`;
  return baseUrl + normalizedPath + (search || '');
}
