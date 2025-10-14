"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
class GeminiService {
    constructor(apiKey) {
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
    async enhanceProductImage(imageBase64) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        try {
            console.log('🤖 Starting Gemini AI image enhancement...');
            const modelName = 'gemini-2.5-flash-image'; // Modelo correcto para edición de imágenes
            // Prompt simplificado para prueba inicial
            const prompt = `Remove the background from this product image and replace it with a pure white background. Improve the lighting and sharpness of the product.`;
            console.log('📝 Using model:', modelName);
            console.log('📝 Sending request to Gemini AI...');
            // Lazy initialization: Crear GoogleGenerativeAI solo cuando se necesita
            console.log('🔧 Initializing Gemini client...');
            const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
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
                candidatesLength: (_a = response.candidates) === null || _a === void 0 ? void 0 : _a.length,
                firstCandidate: ((_b = response.candidates) === null || _b === void 0 ? void 0 : _b[0]) ? 'exists' : 'null',
                hasContent: !!((_d = (_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.content),
                hasParts: !!((_g = (_f = (_e = response.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts),
                partsLength: (_l = (_k = (_j = (_h = response.candidates) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.content) === null || _k === void 0 ? void 0 : _k.parts) === null || _l === void 0 ? void 0 : _l.length,
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
                hasParts: !!((_m = firstCandidate.content) === null || _m === void 0 ? void 0 : _m.parts),
                partsLength: (_p = (_o = firstCandidate.content) === null || _o === void 0 ? void 0 : _o.parts) === null || _p === void 0 ? void 0 : _p.length,
            }, null, 2));
            if (!firstCandidate.content || !firstCandidate.content.parts) {
                console.error('❌ No content or parts in candidate');
                throw new Error('Invalid response structure from Gemini');
            }
            const parts = firstCandidate.content.parts;
            console.log('🔍 Parts structure:', JSON.stringify(parts.map((part, index) => ({
                index,
                hasText: !!part.text,
                hasInlineData: !!part.inlineData,
                inlineDataKeys: part.inlineData ? Object.keys(part.inlineData) : [],
            })), null, 2));
            // Buscar la parte que contiene inlineData
            const enhancedImagePart = (_q = parts.find((part) => part.inlineData)) === null || _q === void 0 ? void 0 : _q.inlineData;
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
        }
        catch (error) {
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
exports.GeminiService = GeminiService;
//# sourceMappingURL=gemini.service.js.map