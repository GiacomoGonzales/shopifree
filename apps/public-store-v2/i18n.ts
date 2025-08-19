// 🚀 SIMPLIFICADO: Ya no se basa en URL, sino en configuración SSR de tienda
// Los locales soportados ahora son manejados por primaryLocale de la tienda
export const SUPPORTED_LOCALES = ['es', 'en', 'pt'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Para single locale mode, no necesitamos getRequestConfig basado en URL
// Los mensajes se cargan directamente en el layout según la configuración de la tienda


