import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

const locales = ['es', 'en'] as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as any)) notFound();

  setRequestLocale(locale);

  let messages: Record<string, any> = {};
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {}

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}


