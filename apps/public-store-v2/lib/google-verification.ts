/**
 * Utilidades para normalizar y manejar tokens de Google Search Console
 */

/**
 * Extrae el token limpio de verificación de Google desde diferentes formatos
 * 
 * Formatos soportados:
 * - "abc123def456" (token directo)
 * - "google-site-verification=abc123def456" (meta tag format)
 * - "googleabc123def456.html" (archivo HTML format)
 * 
 * @param rawValue - Valor crudo desde la base de datos
 * @returns Token limpio o null si no es válido
 */
export function extractGoogleVerificationToken(rawValue: string | null | undefined): string | null {
  if (!rawValue || typeof rawValue !== 'string') {
    return null;
  }

  const trimmed = rawValue.trim();
  
  // Si está vacío, retornar null
  if (!trimmed) {
    return null;
  }

  // Caso 1: Formato meta tag - "google-site-verification=TOKEN"
  if (trimmed.startsWith('google-site-verification=')) {
    const token = trimmed.replace('google-site-verification=', '');
    return token.length > 0 ? token : null;
  }

  // Caso 2: Formato archivo HTML - "googleTOKEN.html"
  if (trimmed.startsWith('google') && trimmed.endsWith('.html')) {
    const token = trimmed.replace(/^google/, '').replace(/\.html$/, '');
    return token.length > 0 ? token : null;
  }

  // Caso 3: Token directo - validar que sea alfanumérico
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return trimmed;
  }

  // Formato no reconocido
  return null;
}

/**
 * Valida si un token de Google es válido
 * Los tokens de Google suelen tener 64+ caracteres alfanuméricos
 */
export function isValidGoogleToken(token: string | null): boolean {
  if (!token) return false;
  
  // Validar formato: solo alfanumérico, guiones y guiones bajos
  if (!/^[a-zA-Z0-9_-]+$/.test(token)) return false;
  
  // Validar longitud mínima (Google tokens suelen ser 64+ chars)
  if (token.length < 16) return false;
  
  return true;
}

/**
 * Normaliza el valor para guardar en BD (solo el token limpio)
 */
export function normalizeGoogleVerificationForDB(rawValue: string | null | undefined): string | null {
  const token = extractGoogleVerificationToken(rawValue);
  return isValidGoogleToken(token) ? token : null;
}

/**
 * Genera el contenido HTML para verificación por archivo
 */
export function generateGoogleVerificationHTML(token: string): string {
  if (!isValidGoogleToken(token)) {
    throw new Error('Token de Google inválido para generar HTML');
  }

  return `google-site-verification: ${token}`;
}

/**
 * Genera el nombre de archivo para verificación HTML
 */
export function generateGoogleVerificationFilename(token: string): string {
  if (!isValidGoogleToken(token)) {
    throw new Error('Token de Google inválido para generar filename');
  }

  return `google${token}.html`;
}
