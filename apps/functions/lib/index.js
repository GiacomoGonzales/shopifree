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
exports.processImageEnhancement = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const gemini_service_1 = require("./services/gemini.service");
const cloudinary_service_1 = require("./services/cloudinary.service");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
// Inicializar Firebase Admin
admin.initializeApp();
/**
 * Cloud Function que se dispara cuando se crea un nuevo job de mejora de imagen
 * Triggered by Firestore onCreate en la colección imageJobs
 */
exports.processImageEnhancement = functions.firestore
    .document('imageJobs/{jobId}')
    .onCreate(async (snapshot, context) => {
    const jobId = context.params.jobId;
    const jobData = snapshot.data();
    console.log('🎨 ============================================');
    console.log('🎨 Processing Image Enhancement Job');
    console.log('🎨 Job ID:', jobId);
    console.log('🎨 ============================================');
    // Usar Firebase Admin SDK directamente en lugar de snapshot.ref
    const db = admin.firestore();
    const jobRef = db.collection('imageJobs').doc(jobId);
    try {
        // Actualizar estado a PROCESSING
        console.log('📝 Updating job status to PROCESSING...');
        await jobRef.update({
            status: 'PROCESSING',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Job status updated to PROCESSING');
        console.log('📝 Job data:', jobData);
        const { imageUrl, mediaFileId, storeId, productId } = jobData;
        if (!imageUrl || !mediaFileId || !storeId || !productId) {
            throw new Error('Missing required job data');
        }
        // 1. Obtener API key de Gemini
        console.log('🔑 Getting Gemini API key...');
        const geminiApiKey = await getGeminiApiKey();
        if (!geminiApiKey) {
            throw new Error('Gemini API key not configured');
        }
        console.log('✅ Gemini API key obtained');
        // 2. Inicializar servicios
        console.log('⚙️  Initializing services...');
        const geminiService = new gemini_service_1.GeminiService(geminiApiKey);
        const cloudinaryService = new cloudinary_service_1.CloudinaryService();
        console.log('✅ Services initialized');
        // 3. Descargar imagen desde Cloudinary
        console.log('📥 Step 1: Downloading image from Cloudinary...');
        const imageBase64 = await cloudinaryService.downloadImageAsBase64(imageUrl);
        console.log('✅ Image downloaded');
        // 4. Procesar con Gemini AI (esto puede tomar 20-60 segundos)
        console.log('🤖 Step 2: Processing with Gemini AI...');
        console.log('   This may take 20-60 seconds...');
        const enhancedImage = await geminiService.enhanceProductImage(imageBase64);
        console.log('✅ Image enhanced by Gemini AI');
        console.log('   Enhanced image MIME type:', enhancedImage.mimeType);
        console.log('   Enhanced image data length:', enhancedImage.data.length);
        // 5. Preparar nombre de archivo para la imagen mejorada
        const fileName = cloudinaryService.extractFileName(imageUrl);
        const enhancedFileName = `${fileName}_enhanced`;
        console.log('📝 File naming:');
        console.log('   Enhanced file name:', enhancedFileName);
        // 6. Subir imagen mejorada a Cloudinary
        console.log('📤 Step 3: Uploading enhanced image to Cloudinary...');
        const uploadResult = await cloudinaryService.uploadBase64Image(enhancedImage.data, `products/${storeId}`, enhancedFileName, enhancedImage.mimeType);
        console.log('✅ Enhanced image uploaded to Cloudinary');
        // 7. Actualizar Firestore con la imagen del producto
        console.log('💾 Step 4: Updating product in Firestore...');
        const productRef = db
            .collection('stores')
            .doc(storeId)
            .collection('products')
            .doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            throw new Error(`Product ${productId} not found in store ${storeId}`);
        }
        const productData = productDoc.data();
        const mediaFiles = (productData === null || productData === void 0 ? void 0 : productData.mediaFiles) || [];
        // Crear el nuevo media file para la imagen mejorada
        // NOTA: No podemos usar serverTimestamp() dentro de arrays
        // Usamos Timestamp.now() que es un valor estático
        const enhancedMediaFile = {
            id: `enhanced_${mediaFileId}_${Date.now()}`,
            url: uploadResult.url,
            cloudinaryPublicId: uploadResult.publicId,
            type: 'image',
            isEnhanced: true,
            enhancedFrom: mediaFileId,
            enhancedAt: admin.firestore.Timestamp.now()
        };
        console.log('📝 Updating product mediaFiles array...');
        // Agregar al array de mediaFiles
        await productRef.update({
            mediaFiles: [...mediaFiles, enhancedMediaFile],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Product updated with enhanced image');
        // 8. Actualizar job a COMPLETED
        console.log('📝 Updating job status to COMPLETED...');
        await jobRef.update({
            status: 'COMPLETED',
            enhancedImageUrl: uploadResult.url,
            enhancedPublicId: uploadResult.publicId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Job status updated to COMPLETED');
        console.log('🎉 ============================================');
        console.log('🎉 Image Enhancement Completed Successfully!');
        console.log('🎉 Job ID:', jobId);
        console.log('🎉 Enhanced URL:', uploadResult.url);
        console.log('🎉 ============================================');
    }
    catch (error) {
        console.error('❌ ============================================');
        console.error('❌ Error processing job:', jobId);
        console.error('❌ ============================================');
        console.error('❌ Error details:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        // Actualizar job a FAILED
        try {
            console.log('📝 Updating job status to FAILED...');
            // Usar la misma referencia db que se creó arriba
            const db = admin.firestore();
            const failedJobRef = db.collection('imageJobs').doc(jobId);
            await failedJobRef.update({
                status: 'FAILED',
                error: error.message || 'Unknown error',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Job status updated to FAILED');
        }
        catch (updateError) {
            console.error('❌ Error updating job status to FAILED:', updateError);
        }
        // No throw el error - la Cloud Function debe completarse exitosamente
        // para que Firestore no reintente la ejecución
    }
});
/**
 * Helper: Obtiene la API key de Gemini
 * En desarrollo: usa variable de entorno
 * En producción: usa Google Secret Manager
 */
async function getGeminiApiKey() {
    var _a, _b;
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('🔑 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
    // En producción, usar Secret Manager
    if (isProduction) {
        try {
            console.log('🔐 Fetching from Secret Manager...');
            const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
            const client = new SecretManagerServiceClient();
            const projectId = process.env.GCLOUD_PROJECT;
            const secretName = 'gemini-api-key';
            const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
            console.log('🔐 Secret path:', name);
            const [version] = await client.accessSecretVersion({ name });
            const payload = (_b = (_a = version.payload) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.toString();
            if (!payload) {
                throw new Error('Gemini API key not found in Secret Manager');
            }
            console.log('✅ API key fetched from Secret Manager');
            return payload;
        }
        catch (error) {
            console.error('❌ Error fetching from Secret Manager:', error.message);
            console.log('⚠️  Falling back to environment variable...');
        }
    }
    // En desarrollo o como fallback, usar variable de entorno
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable not set');
    }
    console.log('✅ API key loaded from environment variable');
    return apiKey;
}
//# sourceMappingURL=index.js.map