'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  Firestore,
  DocumentData
} from 'firebase/firestore'
import { getFirebaseDb } from '../../../../lib/firebase'
import { useStore } from '../../../../lib/hooks/useStore'
import { toast } from 'sonner'

interface MultiLanguageField {
  es: string
  en: string
}

interface PageFormData {
  title: MultiLanguageField
  slug: string
  content: MultiLanguageField
  seoTitle: MultiLanguageField
  seoDescription: MultiLanguageField
  status: 'published' | 'draft'
}

interface PageProps {
  params: {
    pageId: string
  }
}

export default function EditContentPage({ params }: PageProps) {
  const t = useTranslations('pages.content')
  const router = useRouter()
  const { store } = useStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PageFormData>({
    title: { es: '', en: '' },
    slug: '',
    content: { es: '', en: '' },
    seoTitle: { es: '', en: '' },
    seoDescription: { es: '', en: '' },
    status: 'draft'
  })
  const [errors, setErrors] = useState<Partial<Record<keyof PageFormData, string>>>({})

  const isNew = params.pageId === 'new'
  const currentLanguage = store?.advanced?.language || 'es'

  useEffect(() => {
    if (!store?.id || isNew) {
      setLoading(false)
      return
    }

    const fetchPage = async () => {
      try {
        const db = getFirebaseDb()
        if (!db) throw new Error('Firebase not initialized')

        const pageRef = doc(db as Firestore, 'stores', store.id, 'pages', params.pageId)
        const pageSnap = await getDoc(pageRef)

        if (pageSnap.exists()) {
          const pageData = pageSnap.data() as DocumentData
          setFormData({
            title: pageData.title || { es: '', en: '' },
            slug: pageData.slug || '',
            content: pageData.content || { es: '', en: '' },
            seoTitle: pageData.seoTitle || { es: '', en: '' },
            seoDescription: pageData.seoDescription || { es: '', en: '' },
            status: pageData.status || 'draft'
          })
        } else {
          toast.error(t('errors.pageNotFound'))
          router.push(`/${currentLanguage}/content`)
        }
      } catch (error) {
        console.error('Error fetching page:', error)
        toast.error(t('errors.fetchPage'))
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [store?.id, params.pageId, isNew, router, t, currentLanguage])

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Partial<Record<keyof PageFormData, string>> = {}

    // Validar título
    if (!formData.title[currentLanguage] || formData.title[currentLanguage].length < 5) {
      newErrors.title = t('validation.titleLength')
    }

    // Validar contenido
    if (!formData.content[currentLanguage] || formData.content[currentLanguage].length < 20) {
      newErrors.content = t('validation.contentLength')
    }

    // Validar slug
    if (!formData.slug) {
      newErrors.slug = t('validation.slugRequired')
    } else {
      // Verificar si el slug ya existe
      try {
        const db = getFirebaseDb()
        if (!db) throw new Error('Firebase not initialized')

        const pagesRef = collection(db as Firestore, 'stores', store?.id || '', 'pages')
        const q = query(pagesRef, where('slug', '==', formData.slug))
        const querySnapshot = await getDocs(q)
        
        if (!isNew && querySnapshot.docs.length > 1) {
          newErrors.slug = t('validation.slugExists')
        } else if (isNew && querySnapshot.docs.length > 0) {
          newErrors.slug = t('validation.slugExists')
        }
      } catch (error) {
        console.error('Error checking slug:', error)
        toast.error(t('errors.validation'))
        return false
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!store?.id) {
      toast.error(t('errors.storeNotFound'))
      return
    }

    const isValid = await validateForm()
    if (!isValid) return

    try {
      setSaving(true)
      const db = getFirebaseDb()
      if (!db) throw new Error('Firebase not initialized')

      const pageData = {
        ...formData,
        updatedAt: serverTimestamp()
      }

      if (isNew) {
        const pagesRef = collection(db as Firestore, 'stores', store.id, 'pages')
        const newPageRef = doc(pagesRef)
        await setDoc(newPageRef, {
          ...pageData,
          createdAt: serverTimestamp()
        })
        toast.success(t('success.created'))
      } else {
        const pageRef = doc(db as Firestore, 'stores', store.id, 'pages', params.pageId)
        await updateDoc(pageRef, pageData)
        toast.success(t('success.updated'))
      }

      router.push(`/${currentLanguage}/content`)
    } catch (error) {
      console.error('Error saving page:', error)
      toast.error(isNew ? t('errors.createPage') : t('errors.updatePage'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            {isNew ? t('newPage.title') : t('editPage.title')}
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? t('actions.saving') : t('actions.save')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.title')}
            </label>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Español</label>
                <input
                  type="text"
                  value={formData.title.es}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, es: e.target.value }
                  })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">English</label>
                <input
                  type="text"
                  value={formData.title.en}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, en: e.target.value }
                  })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.slug')}
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({
                ...formData,
                slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
              })}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.status')}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({
                ...formData,
                status: e.target.value as 'published' | 'draft'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="draft">{t('status.draft')}</option>
              <option value="published">{t('status.published')}</option>
            </select>
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.content')}
            </label>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Español</label>
                <textarea
                  value={formData.content.es}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: { ...formData.content, es: e.target.value }
                  })}
                  rows={10}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">English</label>
                <textarea
                  value={formData.content.en}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: { ...formData.content, en: e.target.value }
                  })}
                  rows={10}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* SEO */}
          <div>
            <h3 className="text-lg font-medium mb-4">SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.seoTitle')}
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Español</label>
                    <input
                      type="text"
                      value={formData.seoTitle.es}
                      onChange={(e) => setFormData({
                        ...formData,
                        seoTitle: { ...formData.seoTitle, es: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">English</label>
                    <input
                      type="text"
                      value={formData.seoTitle.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        seoTitle: { ...formData.seoTitle, en: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.seoDescription')}
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Español</label>
                    <textarea
                      value={formData.seoDescription.es}
                      onChange={(e) => setFormData({
                        ...formData,
                        seoDescription: { ...formData.seoDescription, es: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">English</label>
                    <textarea
                      value={formData.seoDescription.en}
                      onChange={(e) => setFormData({
                        ...formData,
                        seoDescription: { ...formData.seoDescription, en: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
} 