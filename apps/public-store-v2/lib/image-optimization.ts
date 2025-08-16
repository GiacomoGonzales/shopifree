/**
 * Utilidades para optimización automática de imágenes con Cloudinary
 * Genera automáticamente versiones optimizadas para diferentes plataformas sociales
 */

/**
 * Genera imagen optimizada para WhatsApp (400x400px) automáticamente desde Cloudinary
 * @param originalImage URL original de la imagen
 * @returns URL optimizada para WhatsApp o imagen original si no es de Cloudinary
 */
export function generateWhatsAppImage(originalImage: string): string {
    if (!originalImage || originalImage === "/default-og.png") {
        return "/default-og.png";
    }
    
    // Si es de Cloudinary, transformar automáticamente a 400x400 para WhatsApp
    if (originalImage.includes('cloudinary.com') && originalImage.includes('/upload/')) {
        return originalImage.replace(
            '/upload/',
            '/upload/c_fill,w_400,h_400,q_auto,f_auto/'
        );
    }
    
    // Si no es de Cloudinary, usar la imagen original
    return originalImage;
}

/**
 * Genera imagen optimizada para redes sociales (1200x630px) automáticamente desde Cloudinary
 * @param originalImage URL original de la imagen
 * @returns URL optimizada para Facebook/Instagram/Twitter o imagen original si no es de Cloudinary
 */
export function optimizeSocialImage(originalImage: string): string {
    if (!originalImage || originalImage === "/default-og.png") {
        return "/default-og.png";
    }
    
    // Si es de Cloudinary y no tiene transformaciones, optimizar para redes sociales
    if (originalImage.includes('cloudinary.com') && originalImage.includes('/upload/') && !originalImage.includes('/upload/c_')) {
        return originalImage.replace(
            '/upload/',
            '/upload/c_fill,w_1200,h_630,q_auto,f_auto/'
        );
    }
    
    return originalImage;
}

/**
 * Valida si una imagen es de Cloudinary y puede ser transformada
 * @param imageUrl URL de la imagen
 * @returns true si la imagen puede ser transformada automáticamente
 */
export function isCloudinaryImage(imageUrl: string): boolean {
    return imageUrl.includes('cloudinary.com') && imageUrl.includes('/upload/');
}

/**
 * Obtiene información sobre las optimizaciones aplicadas a una imagen
 * @param originalImage URL original
 * @param socialImage URL social optimizada
 * @param whatsappImage URL WhatsApp optimizada
 * @returns Objeto con información de debug
 */
export function getImageOptimizationInfo(originalImage: string, socialImage: string, whatsappImage: string) {
    return {
        isCloudinaryOptimized: isCloudinaryImage(originalImage),
        hasSocialOptimization: socialImage.includes('c_fill,w_1200,h_630'),
        hasWhatsAppOptimization: whatsappImage.includes('c_fill,w_400,h_400'),
        originalUrl: originalImage,
        socialUrl: socialImage,
        whatsappUrl: whatsappImage
    };
}

/**
 * Genera todas las versiones de imagen necesarias para metadatos
 * @param originalImage URL original de la imagen
 * @param customWhatsAppImage URL personalizada para WhatsApp (opcional)
 * @returns Objeto con todas las URLs optimizadas
 */
export function generateAllImageVariants(originalImage: string, customWhatsAppImage?: string) {
    const socialImage = optimizeSocialImage(originalImage);
    const whatsappImage = customWhatsAppImage || generateWhatsAppImage(originalImage);
    
    return {
        social: socialImage,
        whatsapp: whatsappImage,
        info: getImageOptimizationInfo(originalImage, socialImage, whatsappImage)
    };
}
