import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Locales soportados
export const locales = ['es', 'en'] as const;

export default getRequestConfig(async ({ locale }) => {
  // Validar locale entrante
  if (!locales.includes(locale as any)) notFound();

  // Cargar mensajes base
  const messages = (await import(`./messages/${locale}.json`).catch(() => ({ default: {} }))).default as Record<string, any>;

  return { messages };
});


