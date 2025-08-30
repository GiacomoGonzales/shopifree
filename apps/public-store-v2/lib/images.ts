/**
 * Si la URL es de Cloudinary, inserta transformaciones para generar una miniatura cuadrada nítida.
 * - Recorta rellenando el marco: c_fill,g_auto
 * - Formato y calidad automáticos: f_auto,q_auto:good
 * - Ancho/alto iguales para cuadrado
 * - dpr_auto para pantallas retina
 */
export function toCloudinarySquare(url: string | undefined | null, size: number = 600): string | undefined {
	if (!url || typeof url !== "string") return undefined;
	try {
		const isCloudinary = url.includes("res.cloudinary.com") && url.includes("/upload/");
		if (!isCloudinary) return url;
		// Insertar transformaciones después de "/upload/" y antes de la siguiente sección
		const marker = "/upload/";
		const idx = url.indexOf(marker);
		if (idx === -1) return url;
		const prefix = url.slice(0, idx + marker.length);
		const suffix = url.slice(idx + marker.length);
		// Si ya hay transformaciones, las reemplazamos por las nuestras para unificar
		// Detectar si el suffix comienza con "v" (version) o ya tiene transforms (letras y coma)
		const hasVersionFirst = /^v\d+/.test(suffix);
		const versionAndRest = hasVersionFirst ? suffix : suffix.replace(/^([^/]+)\//, "");
		// Transformaciones optimizadas para tarjetas de productos cuadradas
		const transforms = `c_fill,g_auto,f_auto,q_auto:best,w_${size},h_${size},dpr_auto,fl_progressive:steep`;
		return `${prefix}${transforms}/${versionAndRest}`;
	} catch (_) {
		return url;
	}
}

/**
 * Optimiza imágenes para cards rectangulares horizontales (2x1)
 * Aspect ratio 2:1, ideal para banners y colecciones destacadas
 */
export function toCloudinaryWide(url: string | undefined | null, width: number = 800): string | undefined {
	if (!url || typeof url !== "string") return undefined;
	try {
		const isCloudinary = url.includes("res.cloudinary.com") && url.includes("/upload/");
		if (!isCloudinary) return url;
		
		const marker = "/upload/";
		const idx = url.indexOf(marker);
		if (idx === -1) return url;
		
		const prefix = url.slice(0, idx + marker.length);
		const suffix = url.slice(idx + marker.length);
		const hasVersionFirst = /^v\d+/.test(suffix);
		const versionAndRest = hasVersionFirst ? suffix : suffix.replace(/^([^/]+)\//, "");
		
		// Transformaciones para formato 2:1 (ancho)
		const height = Math.round(width / 2);
		const transforms = `c_fill,g_auto,ar_2:1,f_auto,q_auto:best,w_${width},h_${height},dpr_auto,fl_progressive:steep`;
		return `${prefix}${transforms}/${versionAndRest}`;
	} catch (_) {
		return url;
	}
}

/**
 * Optimiza imágenes para cards rectangulares verticales (1x2)
 * Aspect ratio 1:2, ideal para productos o colecciones verticales
 */
export function toCloudinaryTall(url: string | undefined | null, width: number = 400): string | undefined {
	if (!url || typeof url !== "string") return undefined;
	try {
		const isCloudinary = url.includes("res.cloudinary.com") && url.includes("/upload/");
		if (!isCloudinary) return url;
		
		const marker = "/upload/";
		const idx = url.indexOf(marker);
		if (idx === -1) return url;
		
		const prefix = url.slice(0, idx + marker.length);
		const suffix = url.slice(idx + marker.length);
		const hasVersionFirst = /^v\d+/.test(suffix);
		const versionAndRest = hasVersionFirst ? suffix : suffix.replace(/^([^/]+)\//, "");
		
		// Transformaciones para formato 1:2 (alto)
		const height = width * 2;
		const transforms = `c_fill,g_auto,ar_1:2,f_auto,q_auto:best,w_${width},h_${height},dpr_auto,fl_progressive:steep`;
		return `${prefix}${transforms}/${versionAndRest}`;
	} catch (_) {
		return url;
	}
}

/**
 * Optimiza imágenes para cards grandes (2x2)
 * Mantiene proporción cuadrada pero con mayor resolución
 */
export function toCloudinaryLarge(url: string | undefined | null, size: number = 1000): string | undefined {
	if (!url || typeof url !== "string") return undefined;
	try {
		const isCloudinary = url.includes("res.cloudinary.com") && url.includes("/upload/");
		if (!isCloudinary) return url;
		
		const marker = "/upload/";
		const idx = url.indexOf(marker);
		if (idx === -1) return url;
		
		const prefix = url.slice(0, idx + marker.length);
		const suffix = url.slice(idx + marker.length);
		const hasVersionFirst = /^v\d+/.test(suffix);
		const versionAndRest = hasVersionFirst ? suffix : suffix.replace(/^([^/]+)\//, "");
		
		// Transformaciones para cards grandes cuadradas
		const transforms = `c_fill,g_auto,ar_1:1,f_auto,q_auto:best,w_${size},h_${size},dpr_auto,fl_progressive:steep`;
		return `${prefix}${transforms}/${versionAndRest}`;
	} catch (_) {
		return url;
	}
}

/**
 * Función universal para optimizar según el tipo de card del mosaico
 */
export function toCloudinaryMosaic(
	url: string | undefined | null, 
	cardType: 'normal' | 'wide' | 'tall' | 'large',
	baseSize: number = 400
): string | undefined {
	switch (cardType) {
		case 'large':
			return toCloudinaryLarge(url, baseSize * 2);
		case 'wide':
			return toCloudinaryWide(url, baseSize * 2);
		case 'tall':
			return toCloudinaryTall(url, baseSize);
		case 'normal':
		default:
			return toCloudinarySquare(url, baseSize);
	}
}


