export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    // Solo guardar el API key, no inicializar GoogleGenerativeAI todavía
    // Esto evita timeouts durante el deployment
    this.apiKey = apiKey;
  }

  /**
   * Mejora una imagen de producto usando Gemini AI
   * Usa el modelo gemini-2.5-flash-image que puede generar/editar imágenes
   * @param imageBase64 Imagen en formato Base64 (sin el prefijo data:image/...)
   * @returns Objeto con imagen mejorada en Base64 y su MIME type
   */
  async enhanceProductImage(imageBase64: string): Promise<{ data: string; mimeType: string }> {
    try {
      console.log('🤖 Starting Gemini AI image enhancement...');

      const modelName = 'gemini-2.5-flash-image'; // Modelo correcto para edición de imágenes

      // Prompt simplificado para prueba inicial
      const prompt = `Remove the background from this product image and replace it with a pure white background. Improve the lighting and sharpness of the product.`;

      console.log('📝 Using model:', modelName);
      console.log('📝 Sending request to Gemini AI...');

      // Lazy initialization: Crear GoogleGenerativeAI solo cuando se necesita
      console.log('🔧 Initializing Gemini client...');
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);
      console.log('✅ Gemini client initialized');

      const model = genAI.getGenerativeModel({
        model: modelName,
      });

      // Configurar para recibir imagen como respuesta
      // NOTA: NO especificamos responseMimeType porque el modelo gemini-2.5-flash-image
      // automáticamente devuelve la imagen como inlineData cuando se le da una imagen de entrada
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
      });

      const response = result.response;

      if (!response) {
        throw new Error('No response from Gemini API');
      }

      console.log('✅ Gemini AI processing completed');

      // DEBUG: Logging detallado de la estructura de respuesta
      console.log('🔍 DEBUG: Response structure:', JSON.stringify({
        hasCandidates: !!response.candidates,
        candidatesLength: response.candidates?.length,
        firstCandidate: response.candidates?.[0] ? 'exists' : 'null',
        hasContent: !!response.candidates?.[0]?.content,
        hasParts: !!response.candidates?.[0]?.content?.parts,
        partsLength: response.candidates?.[0]?.content?.parts?.length,
      }, null, 2));

      // Extraer la imagen Base64 del contenido
      const candidates = response.candidates;

      if (!candidates || candidates.length === 0) {
        console.error('❌ No candidates in response');
        throw new Error('No candidates returned from Gemini');
      }

      const firstCandidate = candidates[0];
      console.log('🔍 First candidate:', JSON.stringify({
        hasContent: !!firstCandidate.content,
        hasParts: !!firstCandidate.content?.parts,
        partsLength: firstCandidate.content?.parts?.length,
      }, null, 2));

      if (!firstCandidate.content || !firstCandidate.content.parts) {
        console.error('❌ No content or parts in candidate');
        throw new Error('Invalid response structure from Gemini');
      }

      const parts = firstCandidate.content.parts;
      console.log('🔍 Parts structure:', JSON.stringify(parts.map((part: any, index: number) => ({
        index,
        hasText: !!part.text,
        hasInlineData: !!part.inlineData,
        inlineDataKeys: part.inlineData ? Object.keys(part.inlineData) : [],
      })), null, 2));

      // Buscar la parte que contiene inlineData
      const enhancedImagePart = parts.find((part: any) => part.inlineData)?.inlineData;

      if (!enhancedImagePart || !enhancedImagePart.data) {
        console.error('❌ No inlineData found in parts');
        console.error('   Available parts:', JSON.stringify(parts, null, 2));
        throw new Error('No enhanced image returned from Gemini');
      }

      console.log('✅ Enhanced image received from Gemini');
      console.log('   Image data length:', enhancedImagePart.data.length);
      console.log('   MIME type:', enhancedImagePart.mimeType || 'image/jpeg');

      // Retorna objeto con data y mimeType
      return {
        data: enhancedImagePart.data,
        mimeType: enhancedImagePart.mimeType || 'image/jpeg'
      };

    } catch (error: any) {
      console.error('❌ Error in Gemini image enhancement:', error);

      if (error.response) {
        console.error('   Response error:', error.response);
      }
      if (error.message) {
        console.error('   Error message:', error.message);
      }

      throw new Error(`Gemini AI processing failed: ${error.message || 'Unknown error'}`);
    }
  }
}
