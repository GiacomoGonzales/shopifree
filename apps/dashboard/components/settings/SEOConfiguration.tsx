'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { StoreWithId } from '../../lib/store'
import { uploadImageToCloudinary, deleteImageFromCloudinary, validateImageFile, replaceImageInCloudinary } from '../../lib/cloudinary'
import Image from 'next/image'

interface SEOData {
  // SEO básico
  metaTitle: string
  metaDescription: string
  keywords: string[]
  
  // Open Graph / Redes sociales
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogImagePublicId: string
  
  // WhatsApp específico
  whatsappImage: string
  whatsappImagePublicId: string
  
  // Favicon
  favicon: string
  faviconPublicId: string
  
  // Configuraciones avanzadas
  robots: 'index,follow' | 'index,nofollow' | 'noindex,follow' | 'noindex,nofollow'
  canonicalUrl: string
  structuredDataEnabled: boolean
  
  // Analytics y seguimiento
  googleAnalytics: string
  googleSearchConsole: string
  metaPixel: string
  tiktokPixel: string
}

interface SEOConfigurationProps {
  store: StoreWithId
  onUpdate: (data: Partial<StoreWithId>) => Promise<boolean>
  saving: boolean
}

export default function SEOConfiguration({ store, onUpdate, saving }: SEOConfigurationProps) {
  const t = useTranslations('settings.seo')
  const tActions = useTranslations('settings.actions')
  
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'advanced'>('basic')
  const [seoData, setSeoData] = useState<SEOData>({
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogImagePublicId: '',
    whatsappImage: '',
    whatsappImagePublicId: '',
    favicon: '',
    faviconPublicId: '',
    robots: 'index,follow',
    canonicalUrl: '',
    structuredDataEnabled: true,
    googleAnalytics: '',
    googleSearchConsole: '',
    metaPixel: '',
    tiktokPixel: ''
  })
  
  const [keywordInput, setKeywordInput] = useState('')
  const [uploadingOgImage, setUploadingOgImage] = useState(false)
  const [uploadingWhatsappImage, setUploadingWhatsappImage] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isDraggingOgImage, setIsDraggingOgImage] = useState(false)
  const [isDraggingWhatsappImage, setIsDraggingWhatsappImage] = useState(false)
  const [isDraggingFavicon, setIsDraggingFavicon] = useState(false)

  // Cargar datos existentes
  useEffect(() => {
    if (store?.advanced?.seo) {
      const existingSeo = store.advanced.seo
      console.log('📄 Loading existing SEO data:', existingSeo)
      setSeoData(prev => ({
        ...prev,
        metaTitle: existingSeo.title || '',
        metaDescription: existingSeo.metaDescription || '',
        keywords: existingSeo.keywords || [],
        ogTitle: existingSeo.ogTitle || '',
        ogDescription: existingSeo.ogDescription || '',
        ogImage: existingSeo.ogImage || '',
        ogImagePublicId: existingSeo.ogImagePublicId || '',
        whatsappImage: existingSeo.whatsappImage || '',
        whatsappImagePublicId: existingSeo.whatsappImagePublicId || '',
        favicon: existingSeo.favicon || '',
        faviconPublicId: existingSeo.faviconPublicId || '',
        robots: existingSeo.robots || 'index,follow',
        canonicalUrl: existingSeo.canonicalUrl || '',
        structuredDataEnabled: existingSeo.structuredDataEnabled ?? true,
        googleAnalytics: store.advanced?.integrations?.googleAnalytics || '',
        googleSearchConsole: existingSeo.googleSearchConsole || '',
        metaPixel: store.advanced?.integrations?.metaPixel || '',
        tiktokPixel: existingSeo.tiktokPixel || ''
      }))
    } else {
      console.log('📄 No existing SEO data found, using defaults')
    }
  }, [store])

  // Detectar y actualizar URL canónica automáticamente cuando se conecta un dominio personalizado
  useEffect(() => {
    const checkAndUpdateCanonicalUrl = async () => {
      if (!store?.id) return
      
      try {
        // Consultar configuración de dominio personalizado
        const db = (await import('../../lib/firebase')).getFirebaseDb()
        if (!db) return
        
        const { doc, getDoc } = await import('firebase/firestore')
        const domainRef = doc(db, 'stores', store.id, 'settings', 'domain')
        const domainSnap = await getDoc(domainRef)
        
        if (domainSnap.exists()) {
          const domainData = domainSnap.data()
          const customDomain = domainData?.customDomain
          const isVerified = domainData?.verified || domainData?.vercelData?.verified
          
          // Obtener la URL canónica actual desde los datos de SEO guardados
          const currentCanonicalUrl = store.advanced?.seo?.canonicalUrl || ''
          const expectedCanonicalUrl = customDomain && isVerified ? `https://${customDomain}` : ''
          
          console.log('🔍 Verificando URL canónica:', {
            customDomain,
            isVerified,
            currentCanonicalUrl,
            expectedCanonicalUrl,
            shouldUpdate: expectedCanonicalUrl && currentCanonicalUrl !== expectedCanonicalUrl
          })
          
          // Si hay un dominio personalizado verificado y la URL canónica no coincide
          if (expectedCanonicalUrl && currentCanonicalUrl !== expectedCanonicalUrl) {
            console.log('🔄 Auto-actualizando URL canónica:', expectedCanonicalUrl)
            
            // Actualizar el estado local
            setSeoData(prev => ({
              ...prev,
              canonicalUrl: expectedCanonicalUrl
            }))
            
            // Guardar automáticamente en Firestore
            await onUpdate({
              advanced: {
                ...store?.advanced,
                seo: {
                  ...store?.advanced?.seo,
                  canonicalUrl: expectedCanonicalUrl
                }
              }
            })
            
            setSaveMessage('✅ URL canónica actualizada automáticamente con el dominio personalizado')
            setTimeout(() => setSaveMessage(null), 4000)
          }
        }
      } catch (error) {
        console.error('❌ Error verificando dominio personalizado:', error)
      }
    }
    
    // Ejecutar cuando tengamos los datos del store cargados
    if (store?.id) {
      checkAndUpdateCanonicalUrl()
    }
  }, [store?.id, store?.advanced?.seo?.canonicalUrl])

  // Debug: Monitorear cambios en ogImage
  useEffect(() => {
    console.log('seoData.ogImage changed:', seoData.ogImage)
  }, [seoData.ogImage])

  const handleInputChange = (field: keyof SEOData, value: string | boolean | string[]) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleKeywordAdd = () => {
    if (keywordInput.trim() && seoData.keywords.length < 10) {
      const newKeywords = [...seoData.keywords, keywordInput.trim()]
      handleInputChange('keywords', newKeywords)
      setKeywordInput('')
    }
  }

  const handleKeywordRemove = (index: number) => {
    const newKeywords = seoData.keywords.filter((_, i) => i !== index)
    handleInputChange('keywords', newKeywords)
  }

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleKeywordAdd()
    }
  }

  // Funciones para subir imágenes Open Graph
  const handleOgImageUpload = async (file: File) => {
    setUploadingOgImage(true)
    setUploadError(null)
    
    try {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }
      
      const result = await uploadImageToCloudinary(
        file, 
        { folder: 'seo/og-images', storeId: store?.id }
      )
      
      // Actualizar el estado local inmediatamente
      const newSeoData = {
        ...seoData,
        ogImage: result.secure_url,
        ogImagePublicId: result.public_id
      }
      setSeoData(newSeoData)
      
      // Guardar automáticamente en Firestore
      await onUpdate({
        advanced: {
          ...store?.advanced,
          seo: {
            ...store?.advanced?.seo,
            title: newSeoData.metaTitle,
            metaDescription: newSeoData.metaDescription,
            keywords: newSeoData.keywords,
            ogTitle: newSeoData.ogTitle,
            ogDescription: newSeoData.ogDescription,
            ogImage: result.secure_url,
            ogImagePublicId: result.public_id,
            favicon: newSeoData.favicon,
            faviconPublicId: newSeoData.faviconPublicId,
            robots: newSeoData.robots,
            canonicalUrl: newSeoData.canonicalUrl,
            structuredDataEnabled: newSeoData.structuredDataEnabled,
            googleSearchConsole: newSeoData.googleSearchConsole,
            tiktokPixel: newSeoData.tiktokPixel
          },
          integrations: {
            ...store?.advanced?.integrations,
            googleAnalytics: newSeoData.googleAnalytics,
            metaPixel: newSeoData.metaPixel
          }
        }
      })
      
      setSaveMessage(t('messages.imageUploadSuccess'))
      setTimeout(() => setSaveMessage(null), 3000)
      
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadError(error instanceof Error ? error.message : t('messages.imageUploadError'))
    } finally {
      setUploadingOgImage(false)
    }
  }

  // Funciones para subir imagen de WhatsApp
  const handleWhatsappImageUpload = async (file: File) => {
    setUploadingWhatsappImage(true)
    setUploadError(null)
    
    try {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }
      
      const result = await uploadImageToCloudinary(
        file, 
        { folder: 'seo/whatsapp-images', storeId: store?.id }
      )
      
      // Actualizar el estado local inmediatamente
      const newSeoData = {
        ...seoData,
        whatsappImage: result.secure_url,
        whatsappImagePublicId: result.public_id
      }
      setSeoData(newSeoData)
      
      // Guardar automáticamente en Firestore
      await onUpdate({
        advanced: {
          ...store?.advanced,
          seo: {
            ...store?.advanced?.seo,
            title: newSeoData.metaTitle,
            metaDescription: newSeoData.metaDescription,
            keywords: newSeoData.keywords,
            ogTitle: newSeoData.ogTitle,
            ogDescription: newSeoData.ogDescription,
            ogImage: newSeoData.ogImage,
            ogImagePublicId: newSeoData.ogImagePublicId,
            whatsappImage: result.secure_url,
            whatsappImagePublicId: result.public_id,
            favicon: newSeoData.favicon,
            faviconPublicId: newSeoData.faviconPublicId,
            robots: newSeoData.robots,
            canonicalUrl: newSeoData.canonicalUrl,
            structuredDataEnabled: newSeoData.structuredDataEnabled,
            googleSearchConsole: newSeoData.googleSearchConsole,
            tiktokPixel: newSeoData.tiktokPixel
          },
          integrations: {
            ...store?.advanced?.integrations,
            googleAnalytics: newSeoData.googleAnalytics,
            metaPixel: newSeoData.metaPixel
          }
        }
      })
      
      setSaveMessage(t('messages.whatsappImageUploadSuccess'))
      setTimeout(() => setSaveMessage(null), 3000)
      
    } catch (error) {
      console.error('Error uploading WhatsApp image:', error)
      setUploadError(error instanceof Error ? error.message : t('messages.imageUploadError'))
    } finally {
      setUploadingWhatsappImage(false)
    }
  }

  // Funciones para subir favicon
  const handleFaviconUpload = async (file: File) => {
    setUploadingFavicon(true)
    setUploadError(null)
    
    try {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }
      
      const result = await uploadImageToCloudinary(
        file, 
        { folder: 'seo/favicons', storeId: store?.id }
      )
      
      handleInputChange('favicon', result.secure_url)
      handleInputChange('faviconPublicId', result.public_id)
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : t('messages.imageUploadError'))
    } finally {
      setUploadingFavicon(false)
    }
  }

  // Handlers para drag & drop Open Graph
  const handleOgImageDragEvents = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOgImage(true)
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOgImage(false)
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOgImage(false)
      
      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleOgImageUpload(files[0])
      }
    }
  }

  // Handlers para drag & drop WhatsApp Image
  const handleWhatsappImageDragEvents = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingWhatsappImage(true)
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingWhatsappImage(false)
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingWhatsappImage(false)
      
      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleWhatsappImageUpload(files[0])
      }
    }
  }

  // Handlers para drag & drop Favicon
  const handleFaviconDragEvents = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingFavicon(true)
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingFavicon(false)
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingFavicon(false)
      
      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFaviconUpload(files[0])
      }
    }
  }

  const handleSave = async () => {
    try {
      const success = await onUpdate({
        advanced: {
          ...store?.advanced,
          seo: {
            ...store?.advanced?.seo,
            title: seoData.metaTitle,
            metaDescription: seoData.metaDescription,
            keywords: seoData.keywords,
            ogTitle: seoData.ogTitle,
            ogDescription: seoData.ogDescription,
            ogImage: seoData.ogImage,
            ogImagePublicId: seoData.ogImagePublicId,
            whatsappImage: seoData.whatsappImage,
            whatsappImagePublicId: seoData.whatsappImagePublicId,
            favicon: seoData.favicon,
            faviconPublicId: seoData.faviconPublicId,
            robots: seoData.robots,
            canonicalUrl: seoData.canonicalUrl,
            structuredDataEnabled: seoData.structuredDataEnabled,
            googleSearchConsole: seoData.googleSearchConsole,
            tiktokPixel: seoData.tiktokPixel
          },
          integrations: {
            ...store?.advanced?.integrations,
            googleAnalytics: seoData.googleAnalytics,
            metaPixel: seoData.metaPixel
          }
        }
      })
      
      if (success) {
        setSaveMessage(t('messages.saveSuccess'))
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage(t('messages.saveError'))
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (error) {
      setSaveMessage(t('messages.saveError'))
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  // Calcular puntuación SEO
  const calculateSeoScore = (): number => {
    let score = 0
    const maxScore = 6
    
    if (seoData.metaTitle && seoData.metaTitle.length >= 30 && seoData.metaTitle.length <= 60) score++
    if (seoData.metaDescription && seoData.metaDescription.length >= 120 && seoData.metaDescription.length <= 160) score++
    if (seoData.ogImage) score++
    if (seoData.keywords.length > 0) score++
    if (seoData.googleAnalytics) score++
    if (seoData.favicon) score++
    
    return Math.round((score / maxScore) * 100)
  }

  const renderBasicSEO = () => (
    <div className="space-y-6">
      {/* Meta Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.metaTitle.label')}
        </label>
        <input
          type="text"
          value={seoData.metaTitle}
          onChange={(e) => handleInputChange('metaTitle', e.target.value)}
          placeholder={t('fields.metaTitle.placeholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          maxLength={60}
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">{t('fields.metaTitle.hint')}</p>
          <span className={`text-xs ${seoData.metaTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
            {seoData.metaTitle.length}/60
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">{t('fields.metaTitle.help')}</p>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.metaDescription.label')}
        </label>
        <textarea
          value={seoData.metaDescription}
          onChange={(e) => handleInputChange('metaDescription', e.target.value)}
          placeholder={t('fields.metaDescription.placeholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          rows={3}
          maxLength={160}
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">{t('fields.metaDescription.hint')}</p>
          <span className={`text-xs ${seoData.metaDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
            {seoData.metaDescription.length}/160
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">{t('fields.metaDescription.help')}</p>
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.keywords.label')}
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={handleKeywordKeyPress}
            placeholder={t('fields.keywords.placeholder')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            disabled={seoData.keywords.length >= 10}
          />
          <button
            type="button"
            onClick={handleKeywordAdd}
            disabled={!keywordInput.trim() || seoData.keywords.length >= 10}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {seoData.keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {keyword}
              <button
                type="button"
                onClick={() => handleKeywordRemove(index)}
                className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500">{t('fields.keywords.hint')}</p>
        <p className="text-xs text-gray-600 mt-1">{t('fields.keywords.help')}</p>
      </div>

      {/* Vista previa de Google */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">{t('preview.google.title')}</h4>
        <div className="space-y-1">
          <div className="text-blue-600 text-lg hover:underline cursor-pointer">
            {seoData.metaTitle || store?.storeName || 'Título de la tienda'}
          </div>
          <div className="text-green-700 text-sm">
            https://{store?.subdomain || 'mi-tienda'}.shopifree.app
          </div>
          <div className="text-gray-600 text-sm">
            {seoData.metaDescription || 'Descripción de la tienda que aparecerá en los resultados de búsqueda...'}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{t('preview.google.description')}</p>
      </div>
    </div>
  )

  const renderSocialSEO = () => (
    <div className="space-y-6">
      {/* Open Graph Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.ogTitle.label')}
        </label>
        <input
          type="text"
          value={seoData.ogTitle}
          onChange={(e) => handleInputChange('ogTitle', e.target.value)}
          placeholder={t('fields.ogTitle.placeholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">{t('fields.ogTitle.hint')}</p>
        <p className="text-xs text-gray-600 mt-1">{t('fields.ogTitle.help')}</p>
      </div>

      {/* Open Graph Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.ogDescription.label')}
        </label>
        <textarea
          value={seoData.ogDescription}
          onChange={(e) => handleInputChange('ogDescription', e.target.value)}
          placeholder={t('fields.ogDescription.placeholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">{t('fields.ogDescription.hint')}</p>
        <p className="text-xs text-gray-600 mt-1">{t('fields.ogDescription.help')}</p>
      </div>

      {/* Sección de imagen para redes sociales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.ogImage.label')}
        </label>
        <p className="text-sm text-gray-600 mb-3">{t('fields.ogImage.description')}</p>
        
        {seoData.ogImage ? (
          <div className="relative">
            <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={seoData.ogImage}
                alt="Open Graph preview"
                fill
                className="object-cover"
                onLoad={() => console.log('OG Image loaded successfully:', seoData.ogImage)}
                onError={(e) => console.error('Error loading OG image:', seoData.ogImage, e)}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleOgImageUpload(file)
                  }}
                  disabled={uploadingOgImage}
                />
                {uploadingOgImage ? t('fields.ogImage.uploading') : t('fields.ogImage.change')}
              </label>
              <button
                type="button"
                onClick={() => {
                  if (seoData.ogImagePublicId) {
                    deleteImageFromCloudinary(seoData.ogImagePublicId)
                  }
                  handleInputChange('ogImage', '')
                  handleInputChange('ogImagePublicId', '')
                }}
                className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
              >
                {t('fields.ogImage.remove')}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDraggingOgImage ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDraggingOgImage(true)
              }}
              onDragLeave={() => setIsDraggingOgImage(false)}
              onDrop={async (e) => {
                e.preventDefault()
                setIsDraggingOgImage(false)
                const file = e.dataTransfer.files[0]
                if (file) handleOgImageUpload(file)
              }}
            >
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleOgImageUpload(file)
                  }}
                  disabled={uploadingOgImage}
                />
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {uploadingOgImage ? t('fields.ogImage.uploading') : t('fields.ogImage.dropzone')}
                </p>
                <p className="mt-1 text-xs text-gray-500">{t('fields.ogImage.hint')}</p>
              </label>
            </div>
          </div>
        )}
        
        {uploadError && (
          <p className="text-sm text-red-600 mt-2">{uploadError}</p>
        )}
      </div>

      {/* Sección de imagen para WhatsApp */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.whatsappImage.label')}
        </label>
        <p className="text-sm text-gray-600 mb-3">{t('fields.whatsappImage.description')}</p>
        
        {seoData.whatsappImage ? (
          <div className="relative">
            <div className="relative w-40 h-40 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={seoData.whatsappImage}
                alt="WhatsApp preview"
                fill
                className="object-cover"
                onLoad={() => console.log('WhatsApp Image loaded successfully:', seoData.whatsappImage)}
                onError={(e) => console.error('Error loading WhatsApp image:', seoData.whatsappImage, e)}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleWhatsappImageUpload(file)
                  }}
                  disabled={uploadingWhatsappImage}
                />
                {uploadingWhatsappImage ? t('fields.whatsappImage.uploading') : t('fields.whatsappImage.change')}
              </label>
              <button
                type="button"
                onClick={() => {
                  if (seoData.whatsappImagePublicId) {
                    deleteImageFromCloudinary(seoData.whatsappImagePublicId)
                  }
                  handleInputChange('whatsappImage', '')
                  handleInputChange('whatsappImagePublicId', '')
                }}
                className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
              >
                {t('fields.whatsappImage.remove')}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDraggingWhatsappImage ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDraggingWhatsappImage(true)
              }}
              onDragLeave={() => setIsDraggingWhatsappImage(false)}
              onDrop={async (e) => {
                e.preventDefault()
                setIsDraggingWhatsappImage(false)
                const file = e.dataTransfer.files[0]
                if (file) handleWhatsappImageUpload(file)
              }}
            >
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleWhatsappImageUpload(file)
                  }}
                  disabled={uploadingWhatsappImage}
                />
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {uploadingWhatsappImage ? t('fields.whatsappImage.uploading') : t('fields.whatsappImage.dropzone')}
                </p>
                <p className="mt-1 text-xs text-gray-500">{t('fields.whatsappImage.hint')}</p>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Vista previa de redes sociales */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">{t('preview.social.title')}</h4>
        <div className="border rounded-lg bg-white p-4 max-w-lg">
          {seoData.ogImage && (
            <div className="relative w-full h-32 bg-gray-100 rounded mb-3 overflow-hidden">
              <Image
                src={seoData.ogImage}
                alt="Social preview"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="space-y-1">
            <div className="font-medium text-gray-900">
              {seoData.ogTitle || seoData.metaTitle || store?.storeName || 'Título para redes sociales'}
            </div>
            <div className="text-gray-600 text-sm">
              {seoData.ogDescription || seoData.metaDescription || 'Descripción para redes sociales...'}
            </div>
            <div className="text-gray-500 text-xs">
              {store?.subdomain || 'mi-tienda'}.shopifree.app
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{t('preview.social.description')}</p>
      </div>
    </div>
  )

  const renderAdvancedSEO = () => (
    <div className="space-y-6">
      {/* Favicon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.favicon.label')}
        </label>
        <p className="text-sm text-gray-600 mb-3">{t('fields.favicon.description')}</p>
        
        {seoData.favicon ? (
          <div className="flex items-center gap-4">
            <div className="relative w-8 h-8 bg-gray-100 rounded overflow-hidden">
              <Image
                src={seoData.favicon}
                alt="Favicon preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex gap-2">
              <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFaviconUpload(file)
                  }}
                  disabled={uploadingFavicon}
                />
                {uploadingFavicon ? t('fields.favicon.uploading') : t('fields.favicon.change')}
              </label>
              <button
                type="button"
                onClick={() => {
                  if (seoData.faviconPublicId) {
                    deleteImageFromCloudinary(seoData.faviconPublicId)
                  }
                  handleInputChange('favicon', '')
                  handleInputChange('faviconPublicId', '')
                }}
                className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
              >
                {t('fields.favicon.remove')}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDraggingFavicon ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDraggingFavicon(true)
              }}
              onDragLeave={() => setIsDraggingFavicon(false)}
              onDrop={async (e) => {
                e.preventDefault()
                setIsDraggingFavicon(false)
                const file = e.dataTransfer.files[0]
                if (file) handleFaviconUpload(file)
              }}
            >
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFaviconUpload(file)
                  }}
                  disabled={uploadingFavicon}
                />
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {uploadingFavicon ? t('fields.favicon.uploading') : t('fields.favicon.dropzone')}
                </p>
                <p className="mt-1 text-xs text-gray-500">{t('fields.favicon.hint')}</p>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Robots */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.robots.label')}
        </label>
        <select
          value={seoData.robots}
          onChange={(e) => handleInputChange('robots', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="index,follow">{t('fields.robots.options.indexFollow')}</option>
          <option value="index,nofollow">{t('fields.robots.options.indexNofollow')}</option>
          <option value="noindex,follow">{t('fields.robots.options.noindexFollow')}</option>
          <option value="noindex,nofollow">{t('fields.robots.options.noindexNofollow')}</option>
        </select>
        <p className="text-xs text-gray-600 mt-1">{t('fields.robots.description')}</p>
      </div>

      {/* URL Canónica */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.canonicalUrl.label')}
        </label>
        <input
          type="url"
          value={seoData.canonicalUrl}
          onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
          placeholder={t('fields.canonicalUrl.placeholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">{t('fields.canonicalUrl.hint')}</p>
        <p className="text-xs text-gray-600 mt-1">{t('fields.canonicalUrl.help')}</p>
        {!seoData.canonicalUrl && (
          <p className="text-xs text-blue-600 mt-1">
            💡 Se configurará automáticamente cuando tengas un dominio personalizado verificado
          </p>
        )}
      </div>

      {/* Datos Estructurados */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={seoData.structuredDataEnabled}
            onChange={(e) => handleInputChange('structuredDataEnabled', e.target.checked)}
            className="rounded border-gray-300 text-black focus:ring-black"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            {t('fields.structuredData.enable')}
          </span>
        </label>
        <p className="text-xs text-gray-600 mt-1">{t('fields.structuredData.description')}</p>
      </div>

      {/* Analytics */}
      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">{t('analytics.title')}</h4>
        <p className="text-sm text-gray-600 mb-4">{t('analytics.description')}</p>
        
        <div className="space-y-4">
          {/* Google Analytics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('analytics.googleAnalytics.label')}
            </label>
            <input
              type="text"
              value={seoData.googleAnalytics}
              onChange={(e) => handleInputChange('googleAnalytics', e.target.value)}
              placeholder={t('analytics.googleAnalytics.placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-1">{t('analytics.googleAnalytics.help')}</p>
          </div>

          {/* Google Search Console */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('analytics.googleSearch.label')}
            </label>
            <input
              type="text"
              value={seoData.googleSearchConsole}
              onChange={(e) => handleInputChange('googleSearchConsole', e.target.value)}
              placeholder={t('analytics.googleSearch.placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-1">{t('analytics.googleSearch.help')}</p>
          </div>

          {/* Meta Pixel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('analytics.metaPixel.label')}
            </label>
            <input
              type="text"
              value={seoData.metaPixel}
              onChange={(e) => handleInputChange('metaPixel', e.target.value)}
              placeholder={t('analytics.metaPixel.placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-1">{t('analytics.metaPixel.help')}</p>
          </div>

          {/* TikTok Pixel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('analytics.tiktokPixel.label')}
            </label>
            <input
              type="text"
              value={seoData.tiktokPixel}
              onChange={(e) => handleInputChange('tiktokPixel', e.target.value)}
              placeholder={t('analytics.tiktokPixel.placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-1">{t('analytics.tiktokPixel.help')}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const seoScore = calculateSeoScore()

  return (
    <div>
      {/* Header con puntuación SEO */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{t('title')}</h3>
            <p className="text-sm text-gray-600 mt-1">{t('subtitle')}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{seoScore}%</div>
            <div className="text-sm text-gray-500">{t('performance.score')}</div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                seoScore >= 80 ? 'bg-green-600' : 
                seoScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${seoScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: 'basic', label: t('sections.basic.title') },
              { key: 'social', label: t('sections.social.title') },
              { key: 'advanced', label: t('sections.advanced.title') }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        {activeTab === 'basic' && renderBasicSEO()}
        {activeTab === 'social' && renderSocialSEO()}
        {activeTab === 'advanced' && renderAdvancedSEO()}
      </div>

      {/* Consejos SEO */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-medium text-blue-900 mb-3">{t('tips.title')}</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          {t.raw('tips.items').map((tip: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Botón guardar */}
      <div className="flex justify-end space-x-3">
        {saveMessage && (
          <div className={`px-3 py-2 rounded text-sm ${
            saveMessage.includes('exitosamente') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {saveMessage}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? t('actions.saving') : t('actions.save')}
        </button>
      </div>
    </div>
  )
} 