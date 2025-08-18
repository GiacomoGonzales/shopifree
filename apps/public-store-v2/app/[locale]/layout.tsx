import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { VALID_LOCALES, isValidLocale } from '../../lib/locale-validation';

export function generateStaticParams() {
  return VALID_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!isValidLocale(locale)) notFound();

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


