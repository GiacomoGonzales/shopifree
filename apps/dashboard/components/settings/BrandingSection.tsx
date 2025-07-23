'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../lib/store'
import { validateImageFile, replaceImageInCloudinary, deleteImageFromCloudinary } from '../../lib/cloudinary'
import { brandColors } from '@shopifree/ui'

interface FormData {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  storefrontImageUrl: string;
  headerLogoUrl: string;
  logoPublicId: string;
  storefrontImagePublicId: string;
  headerLogoPublicId: string;
}

export default function BrandingSection() {
  const { user } = useAuth()
  const t = useTranslations('settings')
  const tActions = useTranslations('settings.actions')
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Estados para drag & drop feedback visual
  const [isDraggingOverLogo, setIsDraggingOverLogo] = useState(false)
  const [isDraggingOverStorefront, setIsDraggingOverStorefront] = useState(false)
  const [isDraggingOverHeaderLogo, setIsDraggingOverHeaderLogo] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    primaryColor: brandColors.primary,
    secondaryColor: brandColors.secondary,
    logoUrl: '',
    storefrontImageUrl: '',
    headerLogoUrl: '',
    logoPublicId: '',
    storefrontImagePublicId: '',
    headerLogoPublicId: '',
  })

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStore = async () => {
      if (!user?.uid) return
      
      try {        
        const userStore = await getUserStore(user.uid)
        setStore(userStore)
        if (userStore) {
          setFormData({
            primaryColor: userStore.primaryColor || brandColors.primary,
            secondaryColor: userStore.secondaryColor || brandColors.secondary,
            logoUrl: userStore.logoUrl || userStore.logo || '',
            storefrontImageUrl: userStore.storefrontImageUrl || userStore.storePhoto || '',
            headerLogoUrl: userStore.headerLogoUrl || '',
            logoPublicId: userStore.logoPublicId || '',
            storefrontImagePublicId: userStore.storefrontImagePublicId || '',
            headerLogoPublicId: userStore.headerLogoPublicId || '',
          })
        }
      } catch (error) {
        console.error('Error loading store:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStore()
  }, [user?.uid])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handler para subir logo
  const handleLogoUpload = async (file: File) => {
    setUploadError(null)
    
    try {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }
      
      const result = await replaceImageInCloudinary(
        file, 
        { folder: 'logos', storeId: store?.id },
        formData.logoPublicId || undefined
      )
      
      handleChange('logoUrl', result.secure_url)
      handleChange('logoPublicId', result.public_id)
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error al subir imagen')
      console.error('Error uploading logo:', error)
    }
  }

  // Handler para subir logo del header
  const handleHeaderLogoUpload = async (file: File) => {
    setUploadError(null)
    
    try {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }
      
      const result = await replaceImageInCloudinary(
        file, 
        { folder: 'logos', storeId: store?.id },
        formData.headerLogoPublicId || undefined
      )
      
      handleChange('headerLogoUrl', result.secure_url)
      handleChange('headerLogoPublicId', result.public_id)
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error al subir imagen')
      console.error('Error uploading header logo:', error)
    }
  }

  // Handler para subir foto de tienda
  const handleStorefrontUpload = async (file: File) => {
    setUploadError(null)
    
    try {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }
      
      const result = await replaceImageInCloudinary(
        file, 
        { folder: 'store_photos', storeId: store?.id },
        formData.storefrontImagePublicId || undefined
      )
      
      handleChange('storefrontImageUrl', result.secure_url)
      handleChange('storefrontImagePublicId', result.public_id)
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error al subir imagen')
      console.error('Error uploading storefront image:', error)
    }
  }

  // Handlers para drag & drop del logo
  const handleLogoDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverLogo(true)
  }

  const handleLogoDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverLogo(false)
  }

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverLogo(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleLogoUpload(files[0])
    }
  }

  // Handlers para drag & drop del logo del header
  const handleHeaderLogoDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverHeaderLogo(true)
  }

  const handleHeaderLogoDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverHeaderLogo(false)
  }

  const handleHeaderLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleHeaderLogoDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverHeaderLogo(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleHeaderLogoUpload(files[0])
    }
  }

  // Handlers para drag & drop de la foto de tienda
  const handleStorefrontDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverStorefront(true)
  }

  const handleStorefrontDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverStorefront(false)
  }

  const handleStorefrontDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleStorefrontDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverStorefront(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleStorefrontUpload(files[0])
    }
  }

  const handleSave = async () => {
    if (!store?.id) return
    
    setSaving(true)
    try {
      await updateStore(store.id, formData)
      setStore(prev => prev ? { ...prev, ...formData } : null)
      setSaveMessage(tActions('saved'))
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error updating store:', error)
      setSaveMessage(tActions('error'))
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              No se pudo cargar la información de tu tienda. Intenta recargar la página.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t('branding.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('branding.subtitle')}</p>
          </div>
          
          {/* Mostrar errores si los hay */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setUploadError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sección de imágenes */}
          <div className="space-y-6">
            <h4 className="text-base font-medium text-gray-900">
              {t('branding.logo')} 
              {store.hasPhysicalLocation && ` & ${t('branding.storePhoto')}`}
            </h4>
            <div className={`grid grid-cols-1 gap-6 ${store.hasPhysicalLocation ? 'lg:grid-cols-2' : ''}`}>
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('branding.logo')}
                </label>
                <div className="relative">
                  {formData.logoUrl ? (
                    /* Vista previa del logo */
                    <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                      <img
                        src={formData.logoUrl}
                        alt="Logo preview"
                        className="w-full h-32 object-contain"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex space-x-2">
                          <label className="px-3 py-1 bg-white text-gray-700 text-xs rounded shadow hover:bg-gray-50 transition-colors cursor-pointer">
                            {t('branding.changeImage')}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleLogoUpload(file)
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={async () => {
                              if (formData.logoPublicId) {
                                await deleteImageFromCloudinary(formData.logoPublicId)
                              }
                              handleChange('logoUrl', '')
                              handleChange('logoPublicId', '')
                            }}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded shadow hover:bg-red-600 transition-colors"
                          >
                            {t('branding.removeImage')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Área de subida */
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer group ${
                        isDraggingOverLogo 
                          ? 'border-gray-400 bg-gray-100 scale-105 shadow-lg' 
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                      }`}
                      onDragEnter={handleLogoDragEnter}
                      onDragLeave={handleLogoDragLeave}
                      onDragOver={handleLogoDragOver}
                      onDrop={handleLogoDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleLogoUpload(file)
                        }}
                      />
                      <div className="space-y-3">
                        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-lg transition-colors ${
                          isDraggingOverLogo 
                            ? 'bg-gray-200' 
                            : 'bg-gray-200 group-hover:bg-gray-300'
                        }`}>
                          {isDraggingOverLogo ? (
                            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            </svg>
                          ) : (
                            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium transition-colors ${
                            isDraggingOverLogo 
                              ? 'text-gray-700' 
                              : 'text-gray-700 group-hover:text-gray-800'
                          }`}>
                            {isDraggingOverLogo ? '¡Suelta aquí tu logo!' : t('branding.logoUploadHint')}
                          </p>
                          <p className={`text-xs mt-1 transition-colors ${
                            isDraggingOverLogo 
                              ? 'text-gray-500' 
                              : 'text-gray-500'
                          }`}>
                            {t('branding.fileFormat')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {t('branding.logoHint')}
                </p>
              </div>

              {/* Store Photo Upload - Solo mostrar si tiene ubicación física */}
              {store.hasPhysicalLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('branding.storePhoto')} <span className="text-gray-400 text-xs">({t('branding.optional')})</span>
                  </label>
                  <div className="relative">
                    {formData.storefrontImageUrl ? (
                      /* Vista previa de la foto de tienda */
                      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                        <img
                          src={formData.storefrontImageUrl}
                          alt="Store photo preview"
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                          <div className="flex space-x-2">
                            <label className="px-3 py-1 bg-white text-gray-700 text-xs rounded shadow hover:bg-gray-50 transition-colors cursor-pointer">
                              {t('branding.changeImage')}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleStorefrontUpload(file)
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={async () => {
                                if (formData.storefrontImagePublicId) {
                                  await deleteImageFromCloudinary(formData.storefrontImagePublicId)
                                }
                                handleChange('storefrontImageUrl', '')
                                handleChange('storefrontImagePublicId', '')
                              }}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded shadow hover:bg-red-600 transition-colors"
                            >
                              {t('branding.removeImage')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Área de subida */
                      <div 
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer group ${
                          isDraggingOverStorefront 
                            ? 'border-gray-400 bg-gray-100 scale-105 shadow-lg' 
                            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                        }`}
                        onDragEnter={handleStorefrontDragEnter}
                        onDragLeave={handleStorefrontDragLeave}
                        onDragOver={handleStorefrontDragOver}
                        onDrop={handleStorefrontDrop}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleStorefrontUpload(file)
                          }}
                        />
                        <div className="space-y-3">
                          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-lg transition-colors ${
                            isDraggingOverStorefront 
                              ? 'bg-gray-200' 
                              : 'bg-gray-200 group-hover:bg-gray-300'
                          }`}>
                            {isDraggingOverStorefront ? (
                              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                              </svg>
                            ) : (
                              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2M7 7h.01M7 11h.01M7 15h.01" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-medium transition-colors ${
                              isDraggingOverStorefront 
                                ? 'text-gray-700' 
                                : 'text-gray-700 group-hover:text-gray-800'
                            }`}>
                              {isDraggingOverStorefront ? '¡Suelta aquí la foto de tu tienda!' : t('branding.storePhotoUploadHint')}
                            </p>
                            <p className={`text-xs mt-1 transition-colors ${
                              isDraggingOverStorefront 
                                ? 'text-gray-500' 
                                : 'text-gray-500'
                            }`}>
                              {t('branding.fileFormat')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {t('branding.storePhotoHint')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sección de colores */}
          <div className="space-y-6">
            <h4 className="text-base font-medium text-gray-900">{t('branding.primaryColor')} & {t('branding.secondaryColor')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('branding.primaryColor')}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('branding.secondaryColor')}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-between items-center">
        {saveMessage && (
          <div className={`px-4 py-2 rounded-md text-sm font-medium ${
            saveMessage === tActions('saved')
              ? 'bg-gray-100 text-gray-800 border border-gray-300'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {saveMessage}
          </div>
        )}
        <div className="ml-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 ${
              saving 
                ? 'bg-gray-600 cursor-wait' 
                : 'bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {saving ? tActions('saving') : tActions('save')}
          </button>
        </div>
      </div>
    </div>
  )
} 