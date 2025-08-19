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
 * Genera Apple Touch Icon optimizado (180x180px) automáticamente desde Cloudinary
 * Apple recomienda específicamente 180x180px para dispositivos iOS modernos
 * @param originalImage URL original de la imagen (preferiblemente el logo de la tienda)
 * @returns URL optimizada para Apple Touch Icon o imagen original si no es de Cloudinary
 */
export function generateAppleTouchIcon(originalImage: string): string {
    if (!originalImage || originalImage === "/default-og.png") {
        return "/default-og.png";
    }
    
    // Si es de Cloudinary, transformar automáticamente a 180x180 para Apple Touch Icon
    if (originalImage.includes('cloudinary.com') && originalImage.includes('/upload/')) {
        return originalImage.replace(
            '/upload/',
            '/upload/c_fill,w_180,h_180,q_auto,f_png/'
        );
    }
    
    // Si no es de Cloudinary, usar la imagen original
    return originalImage;
}

/**
 * Genera imagen optimizada para redes sociales (1200x630px) automáticamente desde Cloudinary
 * @param originalImage URL original de la imagen
 * @param forceJpeg Si true, fuerza formato JPEG en lugar de f_auto para consistencia con og:image:type
 * @returns URL optimizada para Facebook/Instagram/Twitter o imagen original si no es de Cloudinary
 */
export function optimizeSocialImage(originalImage: string, forceJpeg = false): string {
    if (!originalImage || originalImage === "/default-og.png") {
        return "/default-og.png";
    }
    
    // Si es de Cloudinary y no tiene transformaciones, optimizar para redes sociales
    if (originalImage.includes('cloudinary.com') && originalImage.includes('/upload/') && !originalImage.includes('/upload/c_')) {
        const format = forceJpeg ? 'f_jpg' : 'f_auto';
        return originalImage.replace(
            '/upload/',
            `/upload/c_fill,w_1200,h_630,q_auto,${format}/`
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
 * @param forceJpeg Si true, fuerza JPEG para consistencia con og:image:type (por defecto false para mejor rendimiento)
 * @returns Objeto con todas las URLs optimizadas
 */
export function generateAllImageVariants(originalImage: string, customWhatsAppImage?: string, forceJpeg = false) {
    const socialImage = optimizeSocialImage(originalImage, forceJpeg);
    const whatsappImage = customWhatsAppImage || generateWhatsAppImage(originalImage);
    const appleTouchIcon = generateAppleTouchIcon(originalImage);
    
    return {
        social: socialImage,
        whatsapp: whatsappImage,
        appleTouchIcon: appleTouchIcon,
        info: getImageOptimizationInfo(originalImage, socialImage, whatsappImage),
        usingAutoFormat: !forceJpeg // Info para debug
    };
}
