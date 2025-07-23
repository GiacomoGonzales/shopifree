'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../lib/store'

export default function SocialSection() {
  const { user } = useAuth()
  const t = useTranslations('settings')
  const tActions = useTranslations('settings.actions')
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    socialMedia: {
      facebook: '',
      instagram: '',
      tiktok: '',
      x: '',
      snapchat: '',
      linkedin: '',
      telegram: '',
      youtube: '',
      pinterest: ''
    }
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
            socialMedia: {
              facebook: userStore.socialMedia?.facebook || '',
              instagram: userStore.socialMedia?.instagram || '',
              tiktok: userStore.socialMedia?.tiktok || '',
              x: userStore.socialMedia?.x || '',
              snapchat: userStore.socialMedia?.snapchat || '',
              linkedin: userStore.socialMedia?.linkedin || '',
              telegram: userStore.socialMedia?.telegram || '',
              youtube: userStore.socialMedia?.youtube || '',
              pinterest: userStore.socialMedia?.pinterest || ''
            }
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
    const socialField = field.split('.')[1]
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [socialField]: value
      }
    }))
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
            <h3 className="text-lg font-medium text-gray-900">{t('socialMedia.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('socialMedia.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.facebook')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.facebook}
                onChange={(e) => handleChange('socialMedia.facebook', e.target.value)}
                placeholder={t('socialMedia.facebookPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.instagram')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.instagram}
                onChange={(e) => handleChange('socialMedia.instagram', e.target.value)}
                placeholder={t('socialMedia.instagramPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.tiktok')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.tiktok}
                onChange={(e) => handleChange('socialMedia.tiktok', e.target.value)}
                placeholder={t('socialMedia.tiktokPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.x')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.x}
                onChange={(e) => handleChange('socialMedia.x', e.target.value)}
                placeholder={t('socialMedia.xPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.snapchat')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.snapchat}
                onChange={(e) => handleChange('socialMedia.snapchat', e.target.value)}
                placeholder={t('socialMedia.snapchatPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.linkedin')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.linkedin}
                onChange={(e) => handleChange('socialMedia.linkedin', e.target.value)}
                placeholder={t('socialMedia.linkedinPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.telegram')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.telegram}
                onChange={(e) => handleChange('socialMedia.telegram', e.target.value)}
                placeholder={t('socialMedia.telegramPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.youtube')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.youtube}
                onChange={(e) => handleChange('socialMedia.youtube', e.target.value)}
                placeholder={t('socialMedia.youtubePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.pinterest')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.pinterest}
                onChange={(e) => handleChange('socialMedia.pinterest', e.target.value)}
                placeholder={t('socialMedia.pinterestPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
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