import { NextRequest, NextResponse } from 'next/server'

type SEOField = 'metaTitle' | 'metaDescription' | 'keywords' | 'ogTitle' | 'ogDescription'

interface StoreData {
  name: string
  slogan?: string
  description?: string
  businessType?: string
  timezone?: string
}

/**
 * Genera el prompt apropiado según el campo de SEO a generar
 */
function generatePromptForSEOField(field: SEOField, storeData: StoreData): string {
  const { name, slogan, description, businessType, timezone } = storeData

  const contextInfo = `
STORE CONTEXT:
- Store Name: ${name || 'Not provided'}
- Slogan: ${slogan || 'Not provided'}
- Description: ${description || 'Not provided'}
- Business Type: ${businessType || 'Not provided'}
- Timezone: ${timezone || 'Not provided'}
`

  switch (field) {
    case 'metaTitle':
      return `${contextInfo}

Generate a concise, compelling SEO meta title for this online store.

REQUIREMENTS:
- Maximum 60 characters (STRICT LIMIT - count carefully)
- Include the store name
- Should be catchy and professional
- Focus on what makes this store unique
- Use action words or value propositions
- Optimized for search engines
- Must be in Spanish language

IMPORTANT:
- Return ONLY the meta title text, nothing else
- Do NOT include quotes, explanations, or any additional text
- Count characters carefully to stay under 60
- Be concise and impactful

Example format: "Shopifree - Tu Tienda Online Gratis"`

    case 'metaDescription':
      return `${contextInfo}

Generate a compelling SEO meta description for this online store.

REQUIREMENTS:
- Maximum 160 characters (STRICT LIMIT - count carefully)
- Clearly describe what the store offers
- Include a call-to-action
- Mention key benefits or unique selling points
- Should entice users to click
- Optimized for search engines
- Must be in Spanish language

IMPORTANT:
- Return ONLY the meta description text, nothing else
- Do NOT include quotes, explanations, or any additional text
- Count characters carefully to stay under 160
- Be descriptive but concise

Example format: "Crea tu tienda online gratis con Shopifree. Sin comisiones, sin límites. Empieza a vender hoy mismo con todas las herramientas que necesitas."`

    case 'keywords':
      return `${contextInfo}

Generate relevant SEO keywords for this online store.

REQUIREMENTS:
- Generate 8-10 keywords maximum
- Keywords should be relevant to the store's business
- Mix of general and specific terms
- Include both short and long-tail keywords
- Consider what potential customers would search for
- Focus on Spanish language keywords
- Should help with organic search visibility

IMPORTANT:
- Return ONLY a comma-separated list of keywords, nothing else
- Do NOT include quotes, explanations, numbers, or any additional text
- Format: keyword1, keyword2, keyword3, etc.
- No periods at the end
- Be specific and relevant

Example format: "tienda online, ecommerce gratis, vender en línea, crear tienda virtual, plataforma de ventas, comercio electrónico, tienda virtual gratis, vender productos online"`

    case 'ogTitle':
      return `${contextInfo}

Generate a compelling Open Graph title for social media sharing (Facebook, Twitter, LinkedIn, etc.).

REQUIREMENTS:
- Maximum 70 characters (STRICT LIMIT - count carefully)
- Should be engaging and click-worthy for social media
- Include the store name
- Focus on the value proposition or unique selling point
- More conversational than SEO title
- Optimized for social media engagement
- Must be in Spanish language

IMPORTANT:
- Return ONLY the Open Graph title text, nothing else
- Do NOT include quotes, explanations, or any additional text
- Count characters carefully to stay under 70
- Make it appealing for social sharing

Example format: "Descubre Shopifree - Tu Tienda Online Gratis sin Comisiones"`

    case 'ogDescription':
      return `${contextInfo}

Generate an engaging Open Graph description for social media sharing.

REQUIREMENTS:
- Maximum 200 characters (STRICT LIMIT - count carefully)
- Should be more conversational and engaging than meta description
- Include a call-to-action or emotional hook
- Highlight the main benefit or unique value
- Encourage social sharing and clicks
- Optimized for social media platforms
- Must be in Spanish language

IMPORTANT:
- Return ONLY the Open Graph description text, nothing else
- Do NOT include quotes, explanations, or any additional text
- Count characters carefully to stay under 200
- Make it engaging for social media users

Example format: "¿Sueñas con tu propia tienda online? Con Shopifree es posible. Crea tu ecommerce gratis, sin comisiones ni límites. ¡Empieza hoy y vende desde el primer día!"`

    default:
      throw new Error(`Unknown SEO field: ${field}`)
  }
}

/**
 * API Route para generar contenido SEO con IA
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Starting SEO content generation with AI...')

    // 1. Obtener datos del request
    const body = await request.json()
    const { field, storeData } = body as { field: SEOField; storeData: StoreData }

    if (!field || !storeData) {
      return NextResponse.json(
        { success: false, error: 'Missing field or storeData parameters' },
        { status: 400 }
      )
    }

    if (!storeData.name) {
      return NextResponse.json(
        { success: false, error: 'Store name is required' },
        { status: 400 }
      )
    }

    console.log('📝 Generating SEO field:', field)
    console.log('🏪 Store context:', {
      name: storeData.name,
      hasSlogan: !!storeData.slogan,
      hasDescription: !!storeData.description,
      businessType: storeData.businessType,
    })

    // 2. Obtener API key de Gemini
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // 3. Generar prompt según el campo solicitado
    const prompt = generatePromptForSEOField(field, storeData)
    console.log('📝 Generated prompt for field:', field)

    // 4. Procesar con Gemini AI
    console.log('🤖 Processing with Gemini AI...')

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }],
      }],
    })

    const response = result.response

    if (!response) {
      throw new Error('No response from Gemini API')
    }

    // 5. Extraer contenido generado
    const text = response.text()

    if (!text) {
      throw new Error('No text content returned from Gemini')
    }

    // Limpiar el texto (remover quotes, espacios extra, etc.)
    let cleanedText = text.trim()
    cleanedText = cleanedText.replace(/^["']|["']$/g, '') // Remover quotes al inicio/final
    cleanedText = cleanedText.replace(/\n+/g, ' ') // Remover saltos de línea
    cleanedText = cleanedText.trim()

    console.log('✅ SEO content generated successfully')
    console.log('   Field:', field)
    console.log('   Content length:', cleanedText.length)
    console.log('   Content preview:', cleanedText.substring(0, 100))

    // 6. Validar límites de caracteres
    let content = cleanedText
    if (field === 'metaTitle' && content.length > 60) {
      console.warn('⚠️ Meta title exceeds 60 characters, truncating...')
      content = content.substring(0, 60).trim()
    } else if (field === 'metaDescription' && content.length > 160) {
      console.warn('⚠️ Meta description exceeds 160 characters, truncating...')
      content = content.substring(0, 160).trim()
    } else if (field === 'ogTitle' && content.length > 70) {
      console.warn('⚠️ OG title exceeds 70 characters, truncating...')
      content = content.substring(0, 70).trim()
    } else if (field === 'ogDescription' && content.length > 200) {
      console.warn('⚠️ OG description exceeds 200 characters, truncating...')
      content = content.substring(0, 200).trim()
    }

    // 7. Para keywords, convertir a array
    if (field === 'keywords') {
      const keywordsArray = content
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 10) // Máximo 10 keywords

      return NextResponse.json({
        success: true,
        content: keywordsArray,
        field: field,
      })
    }

    // 8. Devolver contenido generado
    return NextResponse.json({
      success: true,
      content: content,
      field: field,
    })

  } catch (error: any) {
    console.error('❌ Error generating SEO content:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate SEO content',
        details: error.message
      },
      { status: 500 }
    )
  }
}
