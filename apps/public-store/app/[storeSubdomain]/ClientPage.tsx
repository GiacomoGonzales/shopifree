'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import { Tienda } from '../../lib/types'
import { ThemeLayoutComponent, ThemeLayoutProps, ThemeComponentProps } from '../../themes/theme-component'
import { StoreProvider } from '../../lib/store-context'
import { getHomePage, StorePage } from '../../lib/pages'

interface ClientPageProps {
  tienda: Tienda
  locale: 'es' | 'en'
}

// Componente de carga
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Cargando...</h2>
    </div>
  </div>
)

// Layout por defecto en caso de error
const DefaultLayout: ThemeLayoutComponent = ({ children }) => (
  <main className="min-h-screen bg-gray-50">{children}</main>
)

// Componente para el contenido de la página
const PageContent = ({ page }: { page: StorePage }) => {
  if (page.status !== 'published' || !page.visible) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-6">Página no disponible</h1>
        <p className="text-lg text-gray-600 text-center">Esta página no está publicada actualmente.</p>
      </div>
    )
  }

  return (
    <div 
      className="store-page-content"
      dangerouslySetInnerHTML={{ __html: page.content }}
    />
  )
}

export default function ClientPage({ tienda, locale }: ClientPageProps) {
  const [messages, setMessages] = useState<any>(null)
  const [homePage, setHomePage] = useState<StorePage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar las traducciones
    import(`../../messages/common/${locale}.json`)
      .then(mod => setMessages(mod.default))
      .catch(error => {
        console.error('Error loading translations:', error)
        // Fallback a un objeto vacío para evitar errores
        setMessages({})
      })

    // Cargar la página principal
    if (tienda.id) {
      getHomePage(tienda.id)
        .then(page => {
          setHomePage(page)
          setLoading(false)
        })
        .catch(error => {
          console.error('Error loading home page:', error)
          setLoading(false)
        })
    }
  }, [tienda.id, locale])

  // Importar dinámicamente los componentes del tema
  const ThemeLayout = dynamic<ThemeLayoutProps>(
    () => import(`../../themes/${tienda.theme}/Layout`).catch(() => {
      console.error(`Theme Layout ${tienda.theme} not found, using default layout`)
      return Promise.resolve(DefaultLayout)
    }),
    {
      loading: () => <LoadingState />,
      ssr: false
    }
  )

  if (!messages || loading) {
    return <LoadingState />
  }

  return (
    <StoreProvider initialStore={tienda}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Suspense fallback={<LoadingState />}>
          <ThemeLayout tienda={tienda}>
            {homePage && <PageContent page={homePage} />}
          </ThemeLayout>
        </Suspense>
      </NextIntlClientProvider>
    </StoreProvider>
  )
} 