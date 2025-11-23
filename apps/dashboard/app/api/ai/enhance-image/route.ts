import { NextRequest, NextResponse } from 'next/server'
import { incrementAIEnhancementUsage } from '../../../../lib/subscription-utils'
import { verifyAuthToken, checkRateLimit, getClientIp, validateImageSize } from '../../../../lib/auth-middleware'

type EnhancementPreset = 'auto' | 'white-bg' | 'lifestyle-bg' | 'with-model' | 'lighting' | 'sharpness' | 'custom'

/**
 * Genera el prompt apropiado según el preset seleccionado
 */
function generatePromptForPreset(
  preset: EnhancementPreset,
  productName?: string,
  productDescription?: string,
  customPrompt?: string
): string {
  const contextInfo = productName || productDescription
    ? `

PRODUCT CONTEXT:
- Product Name: ${productName || 'Not provided'}
- Product Description: ${productDescription || 'Not provided'}`
    : ''

  const baseInstructions = `You are a professional product photographer specializing in e-commerce catalog photography.${contextInfo}

Transform this product image into a professional e-commerce catalog photo.

🔴 CRITICAL REQUIREMENT - PRODUCT FIDELITY:
- The PRODUCT ITSELF must remain EXACTLY as it appears in the original image
- DO NOT change the product's design, colors, patterns, textures, or any visual characteristics
- DO NOT alter logos, text, labels, or branding on the product
- DO NOT modify the product's shape, size, or proportions
- The product must be 100% recognizable as the same item from the original photo
- You may ONLY enhance: lighting, sharpness, and the surrounding context (background, props, models)
- Think of it as: "Same exact product, better presentation"`

  switch (preset) {
    case 'white-bg':
      return `${baseInstructions}

Specifications:
1. FORMAT & COMPOSITION:
   - Convert to perfect 1:1 square format (equal width and height)
   - Center the product prominently (product should occupy 60-70% of the frame)
   - Ensure optimal framing

2. BACKGROUND:
   - Replace with a PURE WHITE background (#FFFFFF)
   - Clean, professional, minimalist catalog style
   - No shadows on the background
   - Product should have subtle shadow underneath for depth

3. LIGHTING & QUALITY:
   - Professional studio lighting
   - Enhance sharpness, clarity, and detail
   - Accurate color representation
   - Bright and clear

IMPORTANT: Pure white background, product centered, catalog-ready. Remember - keep the product EXACTLY as it appears in the original!`

    case 'lifestyle-bg':
      return `${baseInstructions}

Specifications:
1. FORMAT & COMPOSITION:
   - Convert to perfect 1:1 square format (equal width and height)
   - Center the product prominently (product should occupy 60-70% of the frame)
   - Create a natural, contextual composition

2. BACKGROUND & STYLING:
   - Create a natural lifestyle setting appropriate for the product
   - Use complementary props and environment (e.g., wooden table, plants, natural textures)
   - Background should be slightly blurred to keep focus on product
   - Colors and elements should match the product's character
   - Create an aspirational, inviting atmosphere
   - ADD background elements around the product - do NOT change the product itself

3. LIGHTING & QUALITY:
   - Natural-looking, soft lighting
   - Enhance sharpness and detail
   - Warm, inviting tones
   - Professional but approachable aesthetic

IMPORTANT: Natural lifestyle context that enhances the product's appeal. The product itself remains EXACTLY identical to the original - only the background changes.`

    case 'with-model':
      return `${baseInstructions}

Specifications:
1. FORMAT & COMPOSITION:
   - Convert to perfect 1:1 square format (equal width and height)
   - Show a person using, wearing, or holding the product
   - Product should be clearly visible and prominent
   - Person should be contextually appropriate for the product type

2. 🔴 ABSOLUTE PRIORITY - PRESERVE THE EXACT PRODUCT:
   - Use the EXACT SAME product from the original image
   - If it's a shirt with a specific design/color - keep that EXACT shirt
   - If it's food with specific appearance - keep that EXACT food item
   - If it's a supplement bottle with specific label - keep that EXACT bottle
   - DO NOT create a "similar" or "generic" version - use the IDENTICAL product
   - The product in the final image must be pixel-perfect identical to the original
   - ONLY add the model around/with the product - NEVER replace or alter the product itself

3. MODEL & CONTEXT:
   - Add a realistic model appropriate for the product:
     * Clothing/Fashion: Model wearing the EXACT item from the original image
     * Food/Beverages: Person enjoying or holding the EXACT food item
     * Fitness/Supplements: Athletic person holding/displaying the EXACT product
     * Accessories: Person wearing or displaying the EXACT item
     * Beauty products: Model with the EXACT product from original image
   - Model should match the product's target demographic
   - Natural, authentic pose and expression
   - Focus remains on the product - model is secondary

4. BACKGROUND & STYLING:
   - Appropriate lifestyle setting for product and model
   - Clean, professional composition
   - Slightly blurred background
   - Modern, appealing aesthetic

5. LIGHTING & QUALITY:
   - Professional lighting on both product and model
   - Enhanced sharpness and detail
   - Natural, flattering tones
   - Commercial photography quality

🔴 CRITICAL: Think of this as photoshopping a model INTO the existing product photo, NOT creating a new product photo. The product stays 100% identical.`

    case 'lighting':
      return `${baseInstructions}

Specifications:
1. FORMAT & COMPOSITION:
   - Convert to perfect 1:1 square format (equal width and height)
   - Maintain current composition and background
   - Center the product if needed

2. LIGHTING ENHANCEMENT (PRIMARY FOCUS):
   - Dramatically improve lighting quality
   - Add professional studio lighting effects
   - Enhance brightness and contrast
   - Add subtle highlights and shadows for depth
   - Balance exposure across the entire image
   - Remove harsh shadows or overexposed areas

3. MINIMAL OTHER CHANGES:
   - Keep the original background style
   - Maintain product position and angle
   - Subtle sharpness improvement only
   - Preserve the original aesthetic

IMPORTANT: Focus ONLY on lighting improvements. Keep everything else mostly as-is.`

    case 'sharpness':
      return `${baseInstructions}

Specifications:
1. FORMAT & COMPOSITION:
   - Convert to perfect 1:1 square format (equal width and height)
   - Maintain current composition
   - Keep original background and styling

2. SHARPNESS & CLARITY (PRIMARY FOCUS):
   - Dramatically increase image sharpness
   - Enhance fine details and textures
   - Improve edge definition
   - Increase clarity and micro-contrast
   - Make text and patterns more readable
   - Reduce any blur or softness

3. MINIMAL OTHER CHANGES:
   - Keep original lighting
   - Maintain original colors
   - Preserve background exactly
   - Keep product position identical

IMPORTANT: Focus ONLY on sharpness and detail enhancement. Keep everything else unchanged.`

    case 'custom':
      return `${baseInstructions}

Specifications:
1. FORMAT & COMPOSITION:
   - Convert to perfect 1:1 square format (equal width and height)
   - Center the product prominently

2. CUSTOM INSTRUCTIONS:
${customPrompt || 'Improve the image quality and presentation'}

3. GENERAL GUIDELINES:
   - Maintain product authenticity
   - Ensure e-commerce catalog quality
   - Keep the product as the focal point
   - Professional, commercial photography aesthetic

IMPORTANT: Follow the custom instructions while maintaining e-commerce catalog standards.`

    case 'auto':
    default:
      return `${baseInstructions}

Specifications:
1. FORMAT & COMPOSITION:
   - Convert to perfect 1:1 square format (equal width and height)
   - Center the product prominently (product should occupy 60-70% of the frame)
   - Improve the angle and perspective to showcase the product's best features
   - Ensure optimal framing that highlights the product's most appealing qualities

2. LIGHTING & QUALITY:
   - Apply professional studio-quality lighting
   - Enhance sharpness, clarity, and detail
   - Improve color accuracy and vibrancy
   - Add subtle shadows and highlights for depth and dimension

3. BACKGROUND & STYLING:
   - Replace the current background with an attractive, professional setting
   - The background should complement the product based on its name and description
   - Create a lifestyle context that enhances the product's appeal (e.g., wooden table, complementary props, natural elements)
   - Keep the background slightly blurred to maintain focus on the product
   - Use colors and elements that match the product's character and target market
   - ADD these elements AROUND the product - the product stays untouched

4. OVERALL AESTHETIC:
   - The final image should look like professional product photography
   - Create an appealing visual that makes customers want to purchase
   - Maintain the product's authenticity while maximizing its visual appeal
   - Ensure the image is suitable for an e-commerce catalog or online store

🔴 CRITICAL REMINDER: The product must remain the clear focal point AND must be IDENTICAL to the original. You are enhancing the PRESENTATION (lighting, background, composition) - NOT redesigning the product. Same exact product, professional presentation.`
  }
}

/**
 * API Route para mejorar imágenes con Gemini AI durante la CREACIÓN de productos
 * Este endpoint NO guarda en Firestore, solo procesa y devuelve la imagen mejorada
 *
 * SECURITY: Protected with authentication, rate limiting, and image size validation
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Starting image enhancement (creation mode)...')

    // SECURITY 1: Verify authentication token
    console.log('🔐 Verifying authentication...')
    const authResult = await verifyAuthToken(request)

    if (!authResult.success) {
      console.error('❌ Authentication failed:', authResult.error)
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 }
      )
    }

    const authenticatedUserId = authResult.uid!
    console.log('✅ User authenticated:', authenticatedUserId)

    // SECURITY 2: Rate limiting by IP
    const clientIp = getClientIp(request)
    console.log('🌐 Client IP:', clientIp)

    const rateLimitResult = checkRateLimit(clientIp, {
      maxRequests: 10, // 10 requests
      windowMs: 60000  // per minute
    })

    if (rateLimitResult.limited) {
      console.error('❌ Rate limit exceeded for IP:', clientIp)
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      )
    }

    console.log('✅ Rate limit check passed. Remaining:', rateLimitResult.remaining)

    // 1. Obtener datos del request
    const body = await request.json()
    const { imageBase64, productName, productDescription, preset = 'auto', customPrompt } = body

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Missing imageBase64 parameter' },
        { status: 400 }
      )
    }

    // SECURITY 3: Validate image size (max 10MB)
    console.log('📏 Validating image size...')
    const sizeValidation = validateImageSize(imageBase64, 10 * 1024 * 1024) // 10MB max

    if (!sizeValidation.valid) {
      console.error('❌ Image size validation failed:', sizeValidation.error)
      return NextResponse.json(
        {
          success: false,
          error: sizeValidation.error,
          sizeBytes: sizeValidation.sizeBytes,
          sizeMB: sizeValidation.sizeMB
        },
        { status: 400 }
      )
    }

    console.log('✅ Image size valid:', sizeValidation.sizeMB.toFixed(2), 'MB')
    console.log('📦 Product context:', { productName, productDescription })
    console.log('🎯 Enhancement preset:', preset)

    // 1.5. Validar límite de uso de IA (solo verificar, no incrementar aquí)
    console.log('🔍 Checking AI enhancement usage limits for user:', authenticatedUserId)

    let usageInfo
    try {
      const { getAIEnhancementUsage } = await import('../../../../lib/subscription-utils')
      usageInfo = await getAIEnhancementUsage(authenticatedUserId)
      console.log('📊 Current usage:', usageInfo)
    } catch (error) {
      console.error('❌ Error checking AI usage:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Error checking AI usage limits',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Verificar si tiene acceso
    if (!usageInfo.hasAccess) {
      console.error('❌ User does not have access to AI enhancements')
      return NextResponse.json(
        {
          success: false,
          error: 'AI enhancement access denied',
          details: 'Your plan does not include AI image enhancements. Please upgrade to continue.'
        },
        { status: 403 }
      )
    }

    // Verificar si tiene límites disponibles (si no es ilimitado)
    if (!usageInfo.isUnlimited && usageInfo.remaining <= 0) {
      console.error('❌ AI enhancement limit reached:', `${usageInfo.used}/${usageInfo.limit}`)
      return NextResponse.json(
        {
          success: false,
          error: 'AI enhancement limit reached',
          details: `You have used all ${usageInfo.limit} AI enhancements this month. Please upgrade to continue.`
        },
        { status: 403 }
      )
    }

    console.log('✅ AI enhancement usage validated. Remaining:', usageInfo.remaining)

    // 2. Obtener API key de Gemini
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // 3. Generar prompt según el preset seleccionado
    const prompt = generatePromptForPreset(preset, productName, productDescription, customPrompt)
    console.log('📝 Generated prompt for preset:', preset)

    // 4. Procesar con Gemini AI (importación dinámica para evitar problemas de edge runtime)
    console.log('🤖 Processing with Gemini AI...')

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' })

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
        ],
      }],
    })

    const response = result.response

    if (!response) {
      throw new Error('No response from Gemini API')
    }

    // 5. Extraer imagen mejorada
    const candidates = response.candidates
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates returned from Gemini')
    }

    const firstCandidate = candidates[0]
    if (!firstCandidate.content || !firstCandidate.content.parts) {
      throw new Error('Invalid response structure from Gemini')
    }

    const parts = firstCandidate.content.parts
    const enhancedImagePart = parts.find((part: any) => part.inlineData)?.inlineData

    if (!enhancedImagePart || !enhancedImagePart.data) {
      throw new Error('No enhanced image returned from Gemini')
    }

    console.log('✅ Image enhanced successfully with preset:', preset)
    console.log('   Enhanced image MIME type:', enhancedImagePart.mimeType || 'image/jpeg')
    console.log('   Enhanced image data length:', enhancedImagePart.data.length)

    // 6. Devolver imagen mejorada
    return NextResponse.json({
      success: true,
      enhancedImageBase64: enhancedImagePart.data,
      mimeType: enhancedImagePart.mimeType || 'image/jpeg',
      preset: preset
    })

  } catch (error: any) {
    console.error('❌ Error enhancing image:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enhance image',
        details: error.message
      },
      { status: 500 }
    )
  }
}
