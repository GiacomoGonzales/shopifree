import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales
const locales = ['en', 'es'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Load base messages
  const baseMessages = (await import(`./messages/${locale}.json`)).default;

  // Load modular messages
  const homeMessages = (await import(`./messages/${locale}/home/index.json`)).default;
  const ordersMessages = (await import(`./messages/${locale}/orders/index.json`)).default;
  const productsMessages = (await import(`./messages/${locale}/products/index.json`)).default;
  const categoriesMessages = (await import(`./messages/${locale}/categories/index.json`)).default;
  const brandsMessages = (await import(`./messages/${locale}/brands/index.json`)).default;
  const collectionsMessages = (await import(`./messages/${locale}/collections/index.json`)).default;
  const customersMessages = (await import(`./messages/${locale}/customers/index.json`)).default;
  const marketingMessages = (await import(`./messages/${locale}/marketing/index.json`)).default;
  const discountsMessages = (await import(`./messages/${locale}/discounts/index.json`)).default;
  const contentMessages = (await import(`./messages/${locale}/content/index.json`)).default;
  const storeDesignMessages = (await import(`./messages/${locale}/store-design/index.json`)).default;
  const reportsMessages = (await import(`./messages/${locale}/reports/index.json`)).default;
  const supportMessages = (await import(`./messages/${locale}/support/index.json`)).default;
  const settingsMessages = (await import(`./messages/${locale}/settings/index.json`)).default;
  const seoMessages = (await import(`./messages/${locale}/settings/seo.json`)).default;
  const onboardingUserMessages = (await import(`./messages/${locale}/onboarding/user.json`)).default;
  const onboardingStoreMessages = (await import(`./messages/${locale}/onboarding/store.json`)).default;

  // Combine all messages
  const messages = {
    ...baseMessages,
    home: homeMessages,
    orders: ordersMessages,
    pages: baseMessages.pages || {},
    products: productsMessages,
    categories: categoriesMessages,
    brands: brandsMessages,
    collections: collectionsMessages,
    customers: customersMessages,
    marketing: marketingMessages,
    discounts: discountsMessages,
    content: contentMessages,
    storeDesign: storeDesignMessages,
    reports: reportsMessages,
    support: supportMessages,
    settings: {
      ...settingsMessages,
      seo: seoMessages
    },
    onboarding: {
      user: onboardingUserMessages,
      store: onboardingStoreMessages
    }
  };

  return {
    messages
  };
}); 