/**
 * Structured Data (Schema.org JSON-LD) Components
 * Estos componentes generan datos estructurados para mejorar el SEO
 */

interface FAQItem {
  question: string
  answer: string
}

/**
 * Organization Schema - Información de la organización
 */
export function OrganizationSchema({ locale }: { locale: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shopifree',
    url: 'https://shopifree.app',
    logo: 'https://shopifree.app/logo-primary.png',
    description: locale === 'es'
      ? 'Plataforma para crear tiendas online gratis sin comisiones'
      : 'Platform to create free online stores without commissions',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/shopifree',
      'https://facebook.com/shopifree',
      'https://instagram.com/shopifree',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@shopifree.app',
      availableLanguage: ['Spanish', 'English'],
      areaServed: 'Worldwide'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Software Application Schema - Información del software/app
 */
export function SoftwareApplicationSchema({ locale }: { locale: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Shopifree',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: locale === 'es'
      ? 'Crea tu tienda online gratis en minutos. Sin comisiones por venta.'
      : 'Create your online store for free in minutes. No sales commissions.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '49',
      offerCount: '3',
      offers: [
        {
          '@type': 'Offer',
          name: locale === 'es' ? 'Plan Gratis' : 'Free Plan',
          price: '0',
          priceCurrency: 'USD',
          description: locale === 'es'
            ? 'Plan gratuito con hasta 12 productos'
            : 'Free plan with up to 12 products'
        },
        {
          '@type': 'Offer',
          name: locale === 'es' ? 'Plan Premium' : 'Premium Plan',
          price: '19',
          priceCurrency: 'USD',
          description: locale === 'es'
            ? 'Plan premium con hasta 99 productos'
            : 'Premium plan with up to 99 products'
        },
        {
          '@type': 'Offer',
          name: locale === 'es' ? 'Plan Pro' : 'Pro Plan',
          price: '49',
          priceCurrency: 'USD',
          description: locale === 'es'
            ? 'Plan profesional con productos ilimitados'
            : 'Professional plan with unlimited products'
        }
      ]
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * FAQ Schema - Preguntas frecuentes
 */
export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * WebSite Schema - Información del sitio web
 */
export function WebSiteSchema({ locale }: { locale: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Shopifree',
    url: `https://shopifree.app/${locale}`,
    description: locale === 'es'
      ? 'Crea tu tienda online gratis sin comisiones'
      : 'Create your online store for free without commissions',
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://shopifree.app/${locale}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Breadcrumb Schema - Migas de pan
 */
export function BreadcrumbSchema({
  items
}: {
  items: Array<{ name: string; url: string }>
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
