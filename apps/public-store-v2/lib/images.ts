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


