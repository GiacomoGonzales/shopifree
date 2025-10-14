import { NextRequest, NextResponse } from 'next/server'

/**
 * Convertir código de idioma a nombre completo
 */
function getLanguageName(langCode: string): string {
  const languages: Record<string, string> = {
    'es': 'Spanish',
    'en': 'English',
    'pt': 'Portuguese',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian'
  }
  return languages[langCode] || 'Spanish'
}

/**
 * API Route para mejorar textos de productos con Gemini AI
 * Mejora nombres y descripciones de productos para e-commerce
 */
export async function POST(request: NextRequest) {
  try {
    console.log('✨ Starting text improvement with AI...')

    // 1. Obtener datos del request
    const body = await request.json()
    const { type, currentText, productName, productDescription, language = 'es' } = body

    if (!type || !['name', 'description', 'seoTitle', 'metaDescription', 'urlSlug', 'slogan'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type parameter. Must be "name", "description", "seoTitle", "metaDescription", "urlSlug", or "slogan"' },
        { status: 400 }
      )
    }

    console.log('📝 Type:', type)
    console.log('📝 Current text:', currentText)
    console.log('🌍 Language:', language)
    console.log('📦 Context:', { productName, productDescription })

    // 2. Obtener API key de Gemini
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // 3. Procesar con Gemini AI
    console.log('🤖 Processing with Gemini AI...')

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
      }
    })

    // 4. Construir prompt según el tipo
    const targetLanguage = getLanguageName(language)
    let prompt = ''

    if (type === 'name') {
      // Mejorar nombre de producto
      if (!currentText || currentText.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: 'Product name must have at least 3 characters' },
          { status: 400 }
        )
      }

      prompt = `You are an expert e-commerce copywriter specializing in product naming.

CURRENT PRODUCT NAME: "${currentText}"

TASK: Transform this product name into a compelling, professional e-commerce product title.

GUIDELINES:
- Make it attractive and marketable
- Keep it concise but descriptive (3-8 words ideal)
- Add relevant adjectives that highlight quality
- Capitalize properly (title case)
- Make it SEO-friendly
- Sound professional but approachable
- The name should make customers want to click and buy

IMPORTANT: Return ONLY the improved product name in ${targetLanguage}, nothing else. No explanations, no quotes, no extra text.

Now improve this product name:`
    } else if (type === 'description') {
      // Mejorar o generar descripción
      const hasCurrentDescription = currentText && currentText.trim().length > 0
      const contextName = productName || currentText

      if (hasCurrentDescription) {
        // MEJORAR descripción existente
        prompt = `You are an expert e-commerce copywriter specializing in product descriptions.

PRODUCT NAME: "${contextName}"
CURRENT DESCRIPTION: "${currentText}"

TASK: Transform this description into compelling, professional e-commerce copy that sells.

GUIDELINES:
- Expand and enhance the current description
- Make it persuasive and benefit-focused
- Highlight key features and benefits
- Use engaging, natural language
- Keep it between 2-3 sentences (40-75 words)
- Focus on what makes the customer want to buy
- Include sensory details and emotional appeals when relevant
- Make it SEO-friendly with natural keyword integration
- End with a subtle call-to-action feeling

IMPORTANT: Return ONLY the improved description in ${targetLanguage}, nothing else. No titles, no quotes, no extra formatting.

Now improve this product description:`
      } else {
        // GENERAR descripción desde cero
        if (!contextName || contextName.trim().length < 3) {
          return NextResponse.json(
            { success: false, error: 'Need at least a product name to generate description' },
            { status: 400 }
          )
        }

        prompt = `You are an expert e-commerce copywriter specializing in product descriptions.

PRODUCT NAME: "${contextName}"

TASK: Create a compelling, professional product description from scratch based on the product name.

GUIDELINES:
- Write 2-3 sentences (40-75 words)
- Make it persuasive and benefit-focused
- Highlight likely key features based on the product name
- Use engaging, natural language
- Focus on what makes the customer want to buy
- Include sensory details and emotional appeals when relevant
- Make it SEO-friendly with natural keyword integration
- Sound authentic and trustworthy
- End with a subtle call-to-action feeling

IMPORTANT: Return ONLY the complete description in ${targetLanguage}, nothing else. No titles, no quotes, no extra formatting.

Now create a product description:`
      }
    } else if (type === 'slogan') {
      // Mejorar o generar slogan
      const contextName = productName || currentText
      const hasCurrentSlogan = currentText && currentText.trim().length > 0

      if (!contextName || contextName.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: 'Need at least a store/product name to generate slogan' },
          { status: 400 }
        )
      }

      if (hasCurrentSlogan) {
        prompt = `You are an expert brand copywriter specializing in creating memorable slogans and taglines.

BRAND/PRODUCT NAME: "${contextName}"
CURRENT SLOGAN: "${currentText}"
${productDescription ? `DESCRIPTION: "${productDescription}"` : ''}

TASK: Transform this slogan into a short, memorable, and impactful brand tagline.

GUIDELINES:
- Keep it VERY SHORT: 3-7 words maximum
- Make it catchy and memorable
- Focus on the main benefit or unique value proposition
- Use powerful, emotional words
- Make it easy to remember and repeat
- Sound natural in ${targetLanguage}
- Avoid clichés and generic phrases
- Create something that stands out

IMPORTANT: Return ONLY the improved slogan in ${targetLanguage}, nothing else. No explanations, no quotes, no extra text.

Now improve this slogan:`
      } else {
        prompt = `You are an expert brand copywriter specializing in creating memorable slogans and taglines.

BRAND/PRODUCT NAME: "${contextName}"
${productDescription ? `DESCRIPTION: "${productDescription}"` : ''}

TASK: Create a short, memorable, and impactful brand tagline from scratch.

GUIDELINES:
- Keep it VERY SHORT: 3-7 words maximum
- Make it catchy and memorable
- Focus on the main benefit or unique value proposition
- Use powerful, emotional words
- Make it easy to remember and repeat
- Sound natural in ${targetLanguage}
- Avoid clichés and generic phrases
- Create something that stands out

IMPORTANT: Return ONLY the slogan in ${targetLanguage}, nothing else. No explanations, no quotes, no extra text.

Now create a slogan:`
      }
    } else if (type === 'seoTitle') {
      // Mejorar o generar SEO Title
      const contextName = productName || currentText
      const hasCurrentTitle = currentText && currentText.trim().length > 0

      if (!contextName || contextName.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: 'Need at least a product name to generate SEO title' },
          { status: 400 }
        )
      }

      if (hasCurrentTitle) {
        prompt = `You are an SEO expert specializing in e-commerce optimization.

PRODUCT NAME: "${contextName}"
CURRENT SEO TITLE: "${currentText}"

TASK: Optimize this SEO title for better search engine rankings and click-through rates.

GUIDELINES:
- Keep it between 50-60 characters (optimal for Google)
- Include main keywords naturally
- Make it compelling and click-worthy
- Use power words that drive clicks
- Front-load important keywords
- Make it accurate to the product
- Sound natural, not stuffed with keywords

IMPORTANT: Return ONLY the optimized SEO title in ${targetLanguage}, nothing else. No explanations, no quotes, no extra text.

Now optimize this SEO title:`
      } else {
        prompt = `You are an SEO expert specializing in e-commerce optimization.

PRODUCT NAME: "${contextName}"
${productDescription ? `PRODUCT DESCRIPTION: "${productDescription}"` : ''}

TASK: Create a compelling SEO title optimized for search engines and user clicks.

GUIDELINES:
- Keep it between 50-60 characters (optimal for Google)
- Include main keywords from the product name
- Make it compelling and click-worthy
- Use power words that drive clicks
- Front-load important keywords
- Make it accurate to the product
- Sound natural, not stuffed with keywords

IMPORTANT: Return ONLY the SEO title in ${targetLanguage}, nothing else. No explanations, no quotes, no extra text.

Now create an SEO title:`
      }
    } else if (type === 'metaDescription') {
      // Mejorar o generar Meta Description
      const contextName = productName || currentText
      const hasCurrentMeta = currentText && currentText.trim().length > 0

      if (!contextName || contextName.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: 'Need at least a product name to generate meta description' },
          { status: 400 }
        )
      }

      if (hasCurrentMeta) {
        prompt = `You are an SEO expert specializing in e-commerce optimization.

PRODUCT NAME: "${contextName}"
CURRENT META DESCRIPTION: "${currentText}"

TASK: Optimize this meta description for better search engine rankings and click-through rates.

GUIDELINES:
- Keep it between 150-160 characters (optimal for Google)
- Include main keywords naturally
- Make it compelling and action-oriented
- Highlight key benefits or unique selling points
- Include a subtle call-to-action
- Make searchers want to click
- Sound natural and engaging

IMPORTANT: Return ONLY the optimized meta description in ${targetLanguage}, nothing else. No explanations, no quotes, no extra text.

Now optimize this meta description:`
      } else {
        prompt = `You are an SEO expert specializing in e-commerce optimization.

PRODUCT NAME: "${contextName}"
${productDescription ? `PRODUCT DESCRIPTION: "${productDescription}"` : ''}

TASK: Create a compelling meta description optimized for search engines and user clicks.

GUIDELINES:
- Keep it between 150-160 characters (optimal for Google)
- Include main keywords from the product name
- Make it compelling and action-oriented
- Highlight key benefits or unique selling points
- Include a subtle call-to-action
- Make searchers want to click
- Sound natural and engaging

IMPORTANT: Return ONLY the meta description in ${targetLanguage}, nothing else. No explanations, no quotes, no extra text.

Now create a meta description:`
      }
    } else if (type === 'urlSlug') {
      // Mejorar o generar URL Slug
      const contextName = productName || currentText
      const hasCurrentSlug = currentText && currentText.trim().length > 0

      if (!contextName || contextName.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: 'Need at least a product name to generate URL slug' },
          { status: 400 }
        )
      }

      if (hasCurrentSlug) {
        prompt = `You are an SEO expert specializing in URL optimization.

PRODUCT NAME: "${contextName}"
CURRENT URL SLUG: "${currentText}"

TASK: Optimize this URL slug for better SEO and readability.

GUIDELINES:
- Use only lowercase letters, numbers, and hyphens
- Keep it short but descriptive (3-5 words ideal)
- Include main keywords
- Remove unnecessary words (a, the, and, etc.)
- Make it readable and memorable
- No special characters, spaces, or accents
- Use hyphens to separate words

IMPORTANT: Return ONLY the optimized URL slug, nothing else. No explanations, no quotes, no extra text.

Example:
- "Mantequilla de Maní Artesanal" → "mantequilla-mani-artesanal"
- "Café Gourmet Premium 100% Orgánico" → "cafe-gourmet-premium-organico"

Now optimize this URL slug:`
      } else {
        prompt = `You are an SEO expert specializing in URL optimization.

PRODUCT NAME: "${contextName}"

TASK: Create an SEO-friendly URL slug from this product name.

GUIDELINES:
- Use only lowercase letters, numbers, and hyphens
- Keep it short but descriptive (3-5 words ideal)
- Include main keywords
- Remove unnecessary words (a, the, and, etc.)
- Make it readable and memorable
- No special characters, spaces, or accents
- Use hyphens to separate words

IMPORTANT: Return ONLY the URL slug, nothing else. No explanations, no quotes, no extra text.

Example:
- "Mantequilla de Maní Artesanal" → "mantequilla-mani-artesanal"
- "Café Gourmet Premium 100% Orgánico" → "cafe-gourmet-premium-organico"

Now create a URL slug:`
      }
    }

    // 5. Llamar a Gemini
    const result = await model.generateContent(prompt)
    const response = result.response
    const improvedText = response.text().trim()

    console.log('✅ Text improved successfully')
    console.log('   Original:', currentText || '(empty)')
    console.log('   Improved:', improvedText.substring(0, 100) + '...')

    // 6. Devolver texto mejorado
    return NextResponse.json({
      success: true,
      improvedText,
      originalText: currentText || '',
      type
    })

  } catch (error: any) {
    console.error('❌ Error improving text:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to improve text',
        details: error.message
      },
      { status: 500 }
    )
  }
}
