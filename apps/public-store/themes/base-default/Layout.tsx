import { ThemeLayoutProps } from '../theme-component'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function BaseDefaultLayout({ tienda, children }: ThemeLayoutProps) {
  const t = useTranslations('common')

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* HEADER */}
      <header className="w-full px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-bold">{tienda.storeName}</h1>
        <span className="text-sm text-gray-500">{t('cart.title')}</span>
      </header>

      {/* CATEGORÍAS */}
      <nav className="w-full overflow-x-auto px-4 py-2 bg-gray-100 border-b border-gray-300">
        <ul className="flex gap-4 text-sm">
          <li><Link href="#">{t('categories.all')}</Link></li>
          <li><Link href="#">{t('categories.featured')}</Link></li>
          <li><Link href="#">{t('categories.new')}</Link></li>
        </ul>
      </nav>

      {/* CONTENIDO */}
      <main className="flex-1 px-4 py-6">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="w-full px-4 py-4 border-t text-sm text-gray-500 text-center">
        {t('footer.rights')}
      </footer>
    </div>
  )
} 