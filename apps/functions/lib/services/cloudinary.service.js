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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const axios_1 = __importDefault(require("axios"));
class CloudinaryService {
    constructor() {
        this.cloudinaryConfigured = false;
        this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
        this.apiKey = process.env.CLOUDINARY_API_KEY || '';
        this.apiSecret = process.env.CLOUDINARY_API_SECRET || '';
        if (!this.cloudName || !this.apiKey || !this.apiSecret) {
            throw new Error('Cloudinary configuration missing (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET)');
        }
        console.log('✅ Cloudinary service initialized (configuration will be lazy-loaded)');
    }
    /**
     * Lazy initialization de Cloudinary SDK
     */
    async ensureCloudinaryConfigured() {
        if (this.cloudinaryConfigured) {
            return;
        }
        console.log('🔧 Configuring Cloudinary SDK...');
        const { v2: cloudinary } = await Promise.resolve().then(() => __importStar(require('cloudinary')));
        cloudinary.config({
            cloud_name: this.cloudName,
            api_key: this.apiKey,
            api_secret: this.apiSecret,
            secure: true
        });
        this.cloudinaryConfigured = true;
        console.log('✅ Cloudinary SDK configured');
        return cloudinary;
    }
    /**
     * Descarga una imagen desde Cloudinary y la convierte a Base64
     */
    async downloadImageAsBase64(imageUrl) {
        try {
            console.log('📥 Downloading image from Cloudinary:', imageUrl);
            const response = await axios_1.default.get(imageUrl, {
                responseType: 'arraybuffer'
            });
            const buffer = Buffer.from(response.data, 'binary');
            const base64 = buffer.toString('base64');
            console.log('✅ Image downloaded, size:', base64.length, 'characters');
            return base64;
        }
        catch (error) {
            console.error('❌ Error downloading image:', error.message);
            throw new Error(`Failed to download image from Cloudinary: ${error.message}`);
        }
    }
    /**
     * Sube una imagen en Base64 a Cloudinary usando el SDK oficial con credenciales
     */
    async uploadBase64Image(base64Data, folder, fileName, mimeType = 'image/jpeg') {
        try {
            console.log('📤 Uploading image to Cloudinary using SDK...');
            console.log('   Folder:', folder);
            console.log('   Filename:', fileName);
            console.log('   MIME Type:', mimeType);
            console.log('   Base64 data length:', base64Data.length);
            // Validar que la data Base64 no esté vacía
            if (!base64Data || base64Data.length === 0) {
                throw new Error('Base64 data is empty');
            }
            // Construir Data URI con el MIME type correcto
            const dataUri = `data:${mimeType};base64,${base64Data}`;
            console.log('   Data URI preview (first 150 chars):', dataUri.substring(0, 150));
            // Lazy load Cloudinary SDK
            const cloudinary = await this.ensureCloudinaryConfigured();
            if (!cloudinary) {
                throw new Error('Failed to initialize Cloudinary SDK');
            }
            // Subir usando el SDK oficial de Cloudinary con credenciales
            // Esto permite control total sobre folder y public_id sin restricciones
            const uploadResult = await cloudinary.uploader.upload(dataUri, {
                folder: folder, // Carpeta con estructura completa (ej: products/storeId)
                public_id: fileName, // Nombre de archivo sin barras (ej: filename_enhanced)
                resource_type: 'image',
                overwrite: false,
                invalidate: true
            });
            console.log('✅ Image uploaded to Cloudinary using SDK');
            console.log('   URL:', uploadResult.secure_url);
            console.log('   Public ID:', uploadResult.public_id);
            console.log('   Format:', uploadResult.format);
            console.log('   Size:', uploadResult.bytes, 'bytes');
            return {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id
            };
        }
        catch (error) {
            console.error('❌ Error uploading image to Cloudinary:', error.message);
            if (error.error) {
                console.error('   Cloudinary SDK error:', JSON.stringify(error.error, null, 2));
            }
            if (error.http_code) {
                console.error('   HTTP Code:', error.http_code);
            }
            throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
        }
    }
    /**
     * Extrae el public ID de una URL de Cloudinary
     */
    extractPublicId(url) {
        const match = url.match(/\/v\d+\/(.+)\.[^.]+$/);
        return match ? match[1] : null;
    }
    /**
     * Extrae el nombre de archivo (sin extensión) de una URL
     */
    extractFileName(url) {
        const parts = url.split('/');
        const fileNameWithExt = parts[parts.length - 1];
        return fileNameWithExt.split('.')[0];
    }
}
exports.CloudinaryService = CloudinaryService;
//# sourceMappingURL=cloudinary.service.js.map