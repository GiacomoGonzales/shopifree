import axios from 'axios';

export class CloudinaryService {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;
  private cloudinaryConfigured: boolean = false;

  constructor() {
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
  private async ensureCloudinaryConfigured() {
    if (this.cloudinaryConfigured) {
      return;
    }

    console.log('🔧 Configuring Cloudinary SDK...');
    const { v2: cloudinary } = await import('cloudinary');

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
  async downloadImageAsBase64(imageUrl: string): Promise<string> {
    try {
      console.log('📥 Downloading image from Cloudinary:', imageUrl);

      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });

      const buffer = Buffer.from(response.data, 'binary');
      const base64 = buffer.toString('base64');

      console.log('✅ Image downloaded, size:', base64.length, 'characters');
      return base64;

    } catch (error: any) {
      console.error('❌ Error downloading image:', error.message);
      throw new Error(`Failed to download image from Cloudinary: ${error.message}`);
    }
  }

  /**
   * Sube una imagen en Base64 a Cloudinary usando el SDK oficial con credenciales
   */
  async uploadBase64Image(
    base64Data: string,
    folder: string,
    fileName: string,
    mimeType: string = 'image/jpeg'
  ): Promise<{ url: string; publicId: string }> {
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
        folder: folder,           // Carpeta con estructura completa (ej: products/storeId)
        public_id: fileName,      // Nombre de archivo sin barras (ej: filename_enhanced)
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

    } catch (error: any) {
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
  extractPublicId(url: string): string | null {
    const match = url.match(/\/v\d+\/(.+)\.[^.]+$/);
    return match ? match[1] : null;
  }

  /**
   * Extrae el nombre de archivo (sin extensión) de una URL
   */
  extractFileName(url: string): string {
    const parts = url.split('/');
    const fileNameWithExt = parts[parts.length - 1];
    return fileNameWithExt.split('.')[0];
  }
}
