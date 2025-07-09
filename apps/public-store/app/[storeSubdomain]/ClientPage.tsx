'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import { Tienda } from '../../lib/types'
import { ThemeLayoutComponent, ThemeLayoutProps, ThemeComponentProps } from '../../themes/theme-component'
import { StoreProvider } from '../../lib/store-context'

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

export default function ClientPage({ tienda, locale }: ClientPageProps) {
  const [messages, setMessages] = useState<any>(null)

  useEffect(() => {
    // Cargar las traducciones
    import(`../../messages/common/${locale}.json`)
      .then(mod => setMessages(mod.default))
      .catch(error => {
        console.error('Error loading translations:', error)
        // Fallback a un objeto vacío para evitar errores
        setMessages({})
      })
  }, [locale])

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

  const ThemeHome = dynamic<ThemeComponentProps>(
    () => import(`../../themes/${tienda.theme}/Home`).catch(() => {
      console.error(`Theme Home ${tienda.theme} not found, falling back to base-default`)
      // Fallback a un componente simple si Home no existe
      return Promise.resolve(() => <div>Contenido no encontrado.</div>)
    }),
    {
      loading: () => <LoadingState />,
      ssr: false
    }
  )

  if (!messages) {
    return <LoadingState />
  }

  return (
    <StoreProvider initialStore={tienda}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Suspense fallback={<LoadingState />}>
          <ThemeLayout tienda={tienda}>
            <ThemeHome tienda={tienda} />
          </ThemeLayout>
        </Suspense>
      </NextIntlClientProvider>
    </StoreProvider>
  )
} 