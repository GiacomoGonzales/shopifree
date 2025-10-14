import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route para mejorar imágenes con Gemini AI durante la CREACIÓN de productos
 * Este endpoint NO guarda en Firestore, solo procesa y devuelve la imagen mejorada
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Starting image enhancement (creation mode)...')

    // 1. Obtener datos del request
    const body = await request.json()
    const { imageBase64, productName, productDescription } = body

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Missing imageBase64 parameter' },
        { status: 400 }
      )
    }

    console.log('📝 Image data length:', imageBase64.length)
    console.log('📦 Product context:', { productName, productDescription })

    // 2. Obtener API key de Gemini
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // 3. Procesar con Gemini AI (importación dinámica para evitar problemas de edge runtime)
    console.log('🤖 Processing with Gemini AI...')

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' })

    // Prompt contextual mejorado para fotografía de producto profesional
    const contextInfo = productName || productDescription
      ? `

PRODUCT CONTEXT:
- Product Name: ${productName || 'Not provided'}
- Product Description: ${productDescription || 'Not provided'}`
      : ''

    const prompt = `You are a professional product photographer specializing in e-commerce catalog photography.${contextInfo}

Transform this product image into a professional e-commerce catalog photo with these specifications:

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

4. OVERALL AESTHETIC:
   - The final image should look like professional product photography
   - Create an appealing visual that makes customers want to purchase
   - Maintain the product's authenticity while maximizing its visual appeal
   - Ensure the image is suitable for an e-commerce catalog or online store

IMPORTANT: The product must remain the clear focal point. The background and styling should enhance, not distract from, the product itself.`

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

    // 4. Extraer imagen mejorada
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

    console.log('✅ Image enhanced successfully')
    console.log('   Enhanced image MIME type:', enhancedImagePart.mimeType || 'image/jpeg')
    console.log('   Enhanced image data length:', enhancedImagePart.data.length)

    // 5. Devolver imagen mejorada
    return NextResponse.json({
      success: true,
      enhancedImageBase64: enhancedImagePart.data,
      mimeType: enhancedImagePart.mimeType || 'image/jpeg'
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
