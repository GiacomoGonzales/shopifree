/**
 * Utilidades para debugging y validación de SEO
 */

export interface SEODebugInfo {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogImage: string | null
  ogUrl: string
  twitterCard: string
  canonical: string
  keywords: string[]
  robots: string
  errors: string[]
  warnings: string[]
}

/**
 * Valida metadatos SEO y detecta problemas comunes
 */
export function validateSEOMetadata(
  title: string,
  description: string,
  ogTitle: string,
  ogDescription: string,
  ogImage: string | null,
  url: string
): SEODebugInfo {
  const errors: string[] = []
  const warnings: string[] = []

  // Validar título
  if (!title) {
    errors.push('Título faltante')
  } else if (title.length > 60) {
    warnings.push(`Título muy largo (${title.length} caracteres, máximo recomendado: 60)`)
  } else if (title.length < 30) {
    warnings.push(`Título muy corto (${title.length} caracteres, mínimo recomendado: 30)`)
  }

  // Validar descripción
  if (!description) {
    errors.push('Meta descripción faltante')
  } else if (description.length > 160) {
    warnings.push(`Meta descripción muy larga (${description.length} caracteres, máximo recomendado: 160)`)
  } else if (description.length < 120) {
    warnings.push(`Meta descripción muy corta (${description.length} caracteres, mínimo recomendado: 120)`)
  }

  // Validar Open Graph
  if (!ogTitle) {
    warnings.push('Open Graph title faltante')
  }
  if (!ogDescription) {
    warnings.push('Open Graph description faltante')
  }
  if (!ogImage) {
    warnings.push('Open Graph image faltante - esto afectará las vistas previas en redes sociales')
  }

  return {
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl: url,
    twitterCard: 'summary_large_image',
    canonical: url,
    keywords: [],
    robots: 'index,follow',
    errors,
    warnings
  }
}

/**
 * Genera URLs para validar metadatos en herramientas externas
 */
export function generateValidationUrls(storeUrl: string) {
  const encodedUrl = encodeURIComponent(storeUrl)
  
  return {
    facebook: `https://developers.facebook.com/tools/debug/?q=${encodedUrl}`,
    twitter: `https://cards-dev.twitter.com/validator?url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/post-inspector/inspect/${encodedUrl}`,
    whatsapp: `https://developers.facebook.com/tools/debug/?q=${encodedUrl}`, // WhatsApp usa el mismo que Facebook
    opengraph: `https://www.opengraph.xyz/?url=${encodedUrl}`,
    metatags: `https://metatags.io/?url=${encodedUrl}`
  }
}

/**
 * Verifica si una imagen Open Graph es válida
 */
export async function validateOGImage(imageUrl: string): Promise<{
  isValid: boolean
  width?: number
  height?: number
  size?: number
  errors: string[]
}> {
  const errors: string[] = []
  
  try {
    // En un entorno real, aquí harías una petición para verificar la imagen
    // Por ahora, solo validamos que la URL sea válida
    if (!imageUrl) {
      errors.push('URL de imagen vacía')
      return { isValid: false, errors }
    }

    if (!imageUrl.startsWith('http')) {
      errors.push('URL de imagen debe ser absoluta (empezar con http/https)')
    }

    // Validar extensiones comunes
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const hasValidExtension = validExtensions.some(ext => 
      imageUrl.toLowerCase().includes(ext)
    )
    
    if (!hasValidExtension) {
      errors.push('Formato de imagen puede no ser compatible (recomendado: JPG, PNG, WebP)')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  } catch (error) {
    errors.push('Error al validar imagen')
    return { isValid: false, errors }
  }
}

/**
 * Genera un reporte completo de SEO para debugging
 */
export function generateSEOReport(debugInfo: SEODebugInfo, storeUrl: string) {
  const validationUrls = generateValidationUrls(storeUrl)
  
  return {
    ...debugInfo,
    validationUrls,
    score: calculateSEOScore(debugInfo),
    recommendations: generateSEORecommendations(debugInfo)
  }
}

/**
 * Calcula un score básico de SEO
 */
function calculateSEOScore(debugInfo: SEODebugInfo): number {
  let score = 0
  const maxScore = 8

  // Título (2 puntos)
  if (debugInfo.title) {
    score += 1
    if (debugInfo.title.length >= 30 && debugInfo.title.length <= 60) {
      score += 1
    }
  }

  // Descripción (2 puntos)
  if (debugInfo.description) {
    score += 1
    if (debugInfo.description.length >= 120 && debugInfo.description.length <= 160) {
      score += 1
    }
  }

  // Open Graph (3 puntos)
  if (debugInfo.ogTitle) score += 1
  if (debugInfo.ogDescription) score += 1
  if (debugInfo.ogImage) score += 1

  // Sin errores críticos (1 punto)
  if (debugInfo.errors.length === 0) score += 1

  return Math.round((score / maxScore) * 100)
}

/**
 * Genera recomendaciones basadas en el análisis
 */
function generateSEORecommendations(debugInfo: SEODebugInfo): string[] {
  const recommendations: string[] = []

  if (debugInfo.errors.length > 0) {
    recommendations.push('🚨 Corrige los errores críticos primero')
  }

  if (!debugInfo.ogImage) {
    recommendations.push('📸 Agrega una imagen Open Graph para mejorar las vistas previas en redes sociales')
  }

  if (debugInfo.title.length > 60) {
    recommendations.push('✂️ Acorta el título SEO para mejorar la visualización en Google')
  }

  if (debugInfo.description.length > 160) {
    recommendations.push('✂️ Acorta la meta descripción para evitar truncamiento')
  }

  if (debugInfo.title.length < 30) {
    recommendations.push('📝 Expande el título SEO para incluir más palabras clave')
  }

  if (debugInfo.description.length < 120) {
    recommendations.push('📝 Expande la meta descripción para ser más descriptiva')
  }

  return recommendations
}

/**
 * Log de debugging para desarrollo
 */
export function logSEODebug(debugInfo: SEODebugInfo, storeUrl: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 SEO Debug Info:', {
      url: storeUrl,
      title: debugInfo.title,
      description: debugInfo.description,
      ogImage: debugInfo.ogImage,
      score: calculateSEOScore(debugInfo),
      errors: debugInfo.errors,
      warnings: debugInfo.warnings
    })
  }
} 