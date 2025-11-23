'use client'

import { NextIntlClientProvider } from 'next-intl'
import { Providers } from './providers'
import { useEffect, useState } from 'react'

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const [messages, setMessages] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar mensajes de traducción del lado del cliente
    const loadMessages = async () => {
      try {
        
        // Cargar el archivo principal de traducciones (contiene todo)
        const messagesModule = await import(`../../messages/${locale}.json`)
        const mainMessages = messagesModule.default
        
        // Cargar traducciones específicas de secciones para mezclarlas
        const sectionMessages: any = {}
        const sections = ['categories', 'products', 'settings', 'brands', 'collections', 'customers', 'orders', 'discounts', 'marketing', 'store-design', 'support', 'content', 'home', 'reports']
        
        // Intentar cargar cada sección de forma paralela
        const sectionPromises = sections.map(async (section) => {
          try {
            const sectionModule = await import(`../../messages/${locale}/${section}/index.json`)
            return { section, data: sectionModule.default }
          } catch {
            // Si no existe el archivo de sección, usar datos del archivo principal
            return { 
              section, 
              data: mainMessages.pages?.[section] || mainMessages[section] || {} 
            }
          }
        })

        // Cargar específicamente products/create.json
        const productsCreatePromise = (async () => {
          try {
            const productsCreateModule = await import(`../../messages/${locale}/products/create.json`)
            return { section: 'products-create', data: productsCreateModule.default }
          } catch {
            return { section: 'products-create', data: {} }
          }
        })()

        // Cargar específicamente categories/categories.json
        const categoriesPromise = (async () => {
          try {
            const categoriesModule = await import(`../../messages/${locale}/categories/categories.json`)
            return { section: 'categories-list', data: categoriesModule.default }
          } catch {
            return { section: 'categories-list', data: {} }
          }
        })()

        // Cargar específicamente categories/metadata.json
        const metadataPromise = (async () => {
          try {
            const metadataModule = await import(`../../messages/${locale}/categories/metadata.json`)
            return { section: 'categories-metadata', data: metadataModule.default }
          } catch {
            return { section: 'categories-metadata', data: {} }
          }
        })()

        // Cargar específicamente settings.seo desde su archivo separado
        const seoPromise = (async () => {
          try {
            const seoModule = await import(`../../messages/${locale}/settings/seo.json`)
            return { section: 'seo', data: seoModule.default }
          } catch {
            return { section: 'seo', data: {} }
          }
        })()

        // Cargar específicamente onboarding/user.json y onboarding/store.json
        const onboardingUserPromise = (async () => {
          try {
            const onboardingUserModule = await import(`../../messages/${locale}/onboarding/user.json`)
            return { section: 'onboarding-user', data: onboardingUserModule.default }
          } catch {
            return { section: 'onboarding-user', data: {} }
          }
        })()

        const onboardingStorePromise = (async () => {
          try {
            const onboardingStoreModule = await import(`../../messages/${locale}/onboarding/store.json`)
            return { section: 'onboarding-store', data: onboardingStoreModule.default }
          } catch {
            return { section: 'onboarding-store', data: {} }
          }
        })()
        
        const sectionResults = await Promise.all(sectionPromises)
        const seoResult = await seoPromise
        const productsCreateResult = await productsCreatePromise
        const categoriesResult = await categoriesPromise
        const metadataResult = await metadataPromise
        const onboardingUserResult = await onboardingUserPromise
        const onboardingStoreResult = await onboardingStorePromise
        
        // Construir el objeto de secciones
        sectionResults.forEach(({ section, data }) => {
          sectionMessages[section === 'store-design' ? 'storeDesign' : section] = data
        })
        
        // Agregar las traducciones de SEO específicamente para settings.seo
        if (!sectionMessages.settings) {
          sectionMessages.settings = {}
        }
        sectionMessages.settings.seo = seoResult.data

        // Agregar las traducciones de products/create específicamente
        if (!sectionMessages.products) {
          sectionMessages.products = {}
        }
        // Merge con las traducciones existentes de products
        sectionMessages.products = {
          ...sectionMessages.products,
          create: productsCreateResult.data
        }

        // Agregar las traducciones de categorías directamente
        sectionMessages.categorization = {
          categories: categoriesResult.data.categories || {},
          metadata: metadataResult.data.metadata || {}
        }

        // También agregar en el nivel raíz para compatibilidad con useTranslations
        // NO sobrescribir las traducciones principales de categories/index.json
        if (!sectionMessages.categories) {
          sectionMessages.categories = {}
        }
        // Agregar solo las traducciones específicas sin sobrescribir
        sectionMessages.categories = {
          ...sectionMessages.categories,
          categories: categoriesResult.data.categories || {},
          metadata: metadataResult.data.metadata || {}
        }
        
        // Agregar las traducciones de onboarding en la estructura correcta
        sectionMessages.onboarding = {
          user: onboardingUserResult.data,
          store: onboardingStoreResult.data
        }
        
        // Estructura final de mensajes que next-intl espera
        const finalMessages = {
          // Mantener la estructura original del archivo principal
          ...mainMessages,
          // Agregar secciones directamente en el nivel raíz para next-intl
          ...sectionMessages,
          // También mantener la estructura anidada por compatibilidad
          pages: {
            ...mainMessages.pages,
            ...sectionMessages,
            // Asegurar que pages.products.create esté disponible
            products: {
              ...mainMessages.pages?.products,
              ...sectionMessages.products,
              create: productsCreateResult.data
            }
          }
        }

        setMessages(finalMessages)
        
      } catch (error) {
        console.error('❌ Error loading messages:', error)
        // Fallback a inglés
        try {
          console.log('🔄 Intentando cargar traducciones en inglés como fallback')
          const fallbackModule = await import(`../../messages/en.json`)
          setMessages(fallbackModule.default)
        } catch (fallbackError) {
          console.error('❌ Error loading fallback messages:', fallbackError)
          // Fallback final con traducciones básicas
          setMessages({
            navigation: { home: 'Inicio', categories: 'Categorías' },
            categories: { title: 'Categorías', loading: 'Cargando...' },
            loading: { general: 'Cargando...' }
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [locale])

  if (loading) {
    return (
      <html lang={locale}>
        <head>
          <title>Dashboard - Shopifree</title>
          <meta name="description" content="Manage your online store" />
          <script dangerouslySetInnerHTML={{
            __html: `
              // Override any CSP restrictions immediately
              if (typeof window !== 'undefined') {
                // Remove existing CSP meta tags
                const cspMetas = document.querySelectorAll('meta[http-equiv*="Content-Security"], meta[http-equiv*="CSP"]');
                cspMetas.forEach(meta => meta.remove());

                // Add permissive CSP
                const meta = document.createElement('meta');
                meta.httpEquiv = 'Content-Security-Policy';
                meta.content = "script-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob: *; object-src 'none';";
                document.head.appendChild(meta);
              }
            `
          }} />
        </head>
        <body>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontFamily: 'system-ui, sans-serif',
            margin: 0,
            padding: 0,
            backgroundColor: '#ffffff'
          }}>
            {/* Spinner estándar igual al de la página principal */}
            <div style={{
              position: 'relative',
              width: '40px',
              height: '40px'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '40px',
                height: '40px',
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #374151',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </body>
      </html>
    )
  }

  return (
    <html lang={locale}>
      <head>
        <title>Dashboard - Shopifree</title>
        <meta name="description" content="Manage your online store" />

        {/* Google Analytics & Google Ads - IMPORTANTE: Reemplaza los IDs en lib/google-tracking.ts */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              // PASO 1: Reemplaza 'YOUR_GA_ID' con tu ID de Google Analytics (formato: G-XXXXXXXXXX)
              gtag('config', 'YOUR_GA_ID', {
                page_path: window.location.pathname,
              });

              // PASO 2: Reemplaza 'YOUR_AW_ID' con tu ID de Google Ads (formato: AW-XXXXXXXXX)
              gtag('config', 'YOUR_AW_ID');
            `,
          }}
        />

        <script dangerouslySetInnerHTML={{
          __html: `
            // Override any CSP restrictions immediately
            if (typeof window !== 'undefined') {
              // Remove existing CSP meta tags
              const cspMetas = document.querySelectorAll('meta[http-equiv*="Content-Security"], meta[http-equiv*="CSP"]');
              cspMetas.forEach(meta => meta.remove());

              // Add permissive CSP
              const meta = document.createElement('meta');
              meta.httpEquiv = 'Content-Security-Policy';
              meta.content = "script-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob: *; object-src 'none';";
              document.head.appendChild(meta);
            }
          `
        }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
} 