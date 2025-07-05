'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { 
  collection, 
  query, 
  getDocs, 
  Firestore, 
  Timestamp, 
  doc, 
  setDoc, 
  serverTimestamp, 
  where, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore'
import { getFirebaseDb } from '../../../lib/firebase'
import { useStore } from '../../../lib/hooks/useStore'
import { 
  PlusIcon, 
  HelpCircleIcon, 
  StarIcon, 
  Trash2Icon, 
  PencilIcon, 
  LayoutTemplateIcon 
} from 'lucide-react'
import DashboardLayout from '../../../components/DashboardLayout'

// Definición temporal de plantillas mientras se arregla la exportación
const PAGE_TEMPLATES = {
  ABOUT: {
    title: {
      es: 'Quiénes somos',
      en: 'About Us'
    },
    slug: '/quienes-somos',
    content: {
      es: '<p>Información sobre nuestra empresa.</p>',
      en: '<p>Information about our company.</p>'
    }
  },
  CONTACT: {
    title: {
      es: 'Contacto',
      en: 'Contact'
    },
    slug: '/contacto',
    content: {
      es: '<p>Formulario de contacto y medios de comunicación.</p>',
      en: '<p>Contact form and communication channels.</p>'
    }
  },
  LOCATION: {
    title: {
      es: 'Ubícanos',
      en: 'Find Us'
    },
    slug: '/ubicacion',
    content: {
      es: '<p>Información sobre nuestra ubicación y horarios.</p>',
      en: '<p>Information about our location and business hours.</p>'
    }
  },
  CLAIMS: {
    title: {
      es: 'Libro de reclamaciones',
      en: 'Claims Book'
    },
    slug: '/reclamaciones',
    content: {
      es: '<p>Formulario y proceso para registrar reclamos.</p>',
      en: '<p>Form and process to register claims.</p>'
    }
  },
  SERVICES: {
    title: {
      es: 'Servicios',
      en: 'Services'
    },
    slug: '/servicios',
    content: {
      es: '<p>Listado y descripción de nuestros servicios.</p>',
      en: '<p>List and description of our services.</p>'
    }
  }
} as const

type PageTemplateKey = keyof typeof PAGE_TEMPLATES

interface PageData {
  id: string
  slug: string
  title: {
    es: string
    en: string
  }
  content: {
    es: string
    en: string
  }
  status: 'published' | 'draft'
  fixed: boolean
  visible: boolean
  seoTitle: {
    es: string
    en: string
  }
  seoDescription: {
    es: string
    en: string
  }
  createdAt: Date
  updatedAt: Date
}

interface TemplateModalProps {
  onClose: () => void
  onSelect: (template: PageTemplateKey) => void
  locale: string
}

const TemplateModal = ({ onClose, onSelect, locale }: TemplateModalProps) => {
  const t = useTranslations('pages.content')
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">{t('templates.title')}</h3>
        <div className="space-y-2">
          {(Object.entries(PAGE_TEMPLATES) as [PageTemplateKey, (typeof PAGE_TEMPLATES)[PageTemplateKey]][]).map(([key, template]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="font-medium">{template.title[locale as 'es' | 'en']}</div>
              <div className="text-sm text-gray-500">{template.slug}</div>
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {t('actions.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContentPage() {
  const t = useTranslations('pages.content')
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()
  const [pages, setPages] = useState<PageData[]>([])
  const [loading, setLoading] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const locale = store?.advanced?.language || 'es'

  const fetchPages = async () => {
    if (!store?.id) {
      if (!storeLoading) {
        setError(t('errors.storeNotFound'))
      }
      setLoading(false)
      return
    }

    try {
      console.log('Fetching pages for store:', store.id)
      setLoading(true)
      setError(null)
      const db = getFirebaseDb()
      
      if (!db) {
        console.error('Firebase not initialized')
        throw new Error('Firebase not initialized')
      }

      // Usar la ruta correcta para las páginas
      const pagesCollectionRef = collection(db, 'stores', store.id, 'pages')
      
      console.log('Querying collection:', `stores/${store.id}/pages`)
      
      const q = query(pagesCollectionRef)
      const querySnapshot = await getDocs(q)
      
      console.log('Query results:', {
        empty: querySnapshot.empty,
        size: querySnapshot.size,
        docs: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      })

      const pagesData = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date()
        }
      }) as PageData[]

      // Ordenar: página principal primero, luego por fecha de actualización
      setPages(pagesData.sort((a, b) => {
        if (a.slug === '/') return -1
        if (b.slug === '/') return 1
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      }))
    } catch (error) {
      console.error('Error fetching pages:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(`${t('errors.fetchPages')}: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [store?.id, storeLoading, t])

  const handleCreatePage = () => {
    if (!store?.id) {
      setError(t('errors.storeNotFound'))
      return
    }
    router.push(`/${store?.advanced?.language || 'es'}/content/new`)
  }

  const handleEditPage = (pageId: string) => {
    if (!store?.id) {
      setError(t('errors.storeNotFound'))
      return
    }
    router.push(`/${store?.advanced?.language || 'es'}/content/${pageId}`)
  }

  const handleCreateFromTemplate = async (templateKey: PageTemplateKey) => {
    if (!store?.id) {
      setError(t('errors.storeNotFound'))
      return
    }

    try {
      const db = getFirebaseDb()
      if (!db) throw new Error('Firebase not initialized')

      const template = PAGE_TEMPLATES[templateKey]
      
      // Verificar si ya existe una página con ese slug
      const pagesCollectionRef = collection(db, 'stores', store.id, 'pages')
      const q = query(pagesCollectionRef, where('slug', '==', template.slug))
      const existingPage = await getDocs(q)

      if (!existingPage.empty) {
        setError(t('errors.slugExists'))
        return
      }

      // Crear la nueva página
      const newPageRef = doc(pagesCollectionRef)
      await setDoc(newPageRef, {
        title: template.title,
        slug: template.slug,
        content: template.content,
        fixed: false,
        visible: true,
        status: 'draft',
        seoTitle: template.title,
        seoDescription: {
          es: '',
          en: ''
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      setShowTemplateModal(false)
      fetchPages()
    } catch (error) {
      console.error('Error creating template page:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(`${t('errors.createTemplate')}: ${errorMessage}`)
    }
  }

  const handleToggleVisibility = async (pageId: string, visible: boolean) => {
    if (!store?.id) {
      setError(t('errors.storeNotFound'))
      return
    }

    try {
      const db = getFirebaseDb()
      if (!db) throw new Error('Firebase not initialized')

      const pageRef = doc(db as Firestore, `stores/${store.id}/pages/${pageId}`)
      await updateDoc(pageRef, {
        visible,
        updatedAt: serverTimestamp()
      })

      setPages(pages.map(page => 
        page.id === pageId ? { ...page, visible } : page
      ))
    } catch (error) {
      console.error('Error updating page visibility:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(`${t('errors.updateVisibility')}: ${errorMessage}`)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (!store?.id || !window.confirm(t('confirmations.delete'))) return

    try {
      const db = getFirebaseDb()
      if (!db) throw new Error('Firebase not initialized')

      const pageRef = doc(db as Firestore, `stores/${store.id}/pages/${pageId}`)
      await deleteDoc(pageRef)
      
      setPages(pages.filter(page => page.id !== pageId))
    } catch (error) {
      console.error('Error deleting page:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(`${t('errors.deletePage')}: ${errorMessage}`)
    }
  }

  const renderContent = () => {
    // Mostrar el estado de carga mientras la tienda o las páginas están cargando
    if (storeLoading || loading) {
      return (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      )
    }

    // Mostrar error solo si no está cargando y hay un error
    if (error && !storeLoading) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        </div>
      )
    }

    return (
      <>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title={t('help.tooltip')}
            >
              <HelpCircleIcon size={20} />
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LayoutTemplateIcon size={18} />
              {t('actions.createFromTemplate')}
            </button>
            <button
              onClick={handleCreatePage}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <PlusIcon size={18} />
              {t('actions.createPage')}
            </button>
          </div>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">{t('help.title')}</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>{t('help.tip1')}</li>
              <li>{t('help.tip2')}</li>
              <li>{t('help.tip3')}</li>
            </ul>
          </div>
        )}

        {/* Content Table */}
        {pages.length > 0 ? (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">{t('table.title')}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">{t('table.slug')}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">{t('table.status')}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">{t('table.visibility')}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">{t('table.updated')}</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pages.map(page => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {page.title[locale as 'es' | 'en']}
                        {page.fixed && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <StarIcon size={12} />
                            {t('labels.fixed')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{page.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        page.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t(`status.${page.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {page.slug !== '/' && (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={page.visible}
                            onChange={(e) => handleToggleVisibility(page.id, e.target.checked)}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {page.updatedAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditPage(page.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title={t('actions.edit')}
                        >
                          <PencilIcon size={16} />
                        </button>
                        {page.slug !== '/' && (
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title={t('actions.delete')}
                          >
                            <Trash2Icon size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.title')}</h3>
            <p className="text-gray-500 mb-6">{t('empty.description')}</p>
            <button
              onClick={handleCreatePage}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <PlusIcon size={18} />
              {t('actions.createFirstPage')}
            </button>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <TemplateModal
            onClose={() => setShowTemplateModal(false)}
            onSelect={handleCreateFromTemplate}
            locale={locale}
          />
        )}
      </>
    )
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  )
} 