'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import './announcement-bar-animations.css'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../lib/store'
import { useToast } from '../../lib/hooks/useToast'
import { Toast } from '../shared/Toast'

interface AnnouncementBarConfig {
  enabled: boolean;
  message: string;
  backgroundColor: string;
  textColor: string;
  link?: string;
  linkText?: string;
  animation: 'none' | 'slide' | 'fade' | 'bounce';
  animationSpeed: 'slow' | 'normal' | 'fast';
  startDate?: string;
  endDate?: string;
  showOnMobile: boolean;
  showOnDesktop: boolean;
  position: 'top' | 'bottom';
}

export default function AnnouncementBarSection() {
  const { user } = useAuth()
  const t = useTranslations('storeDesign.sections.announcementBar')
  const tActions = useTranslations('storeDesign.actions')
  const { toast, showToast, hideToast } = useToast()

  // Helper para obtener las clases de animación
  const getAnimationClasses = (animation: string, speed: string) => {
    let animationClass = ''
    let speedClass = `animation-${speed}`

    switch (animation) {
      case 'slide':
        animationClass = 'announcement-slide'
        break
      case 'fade':
        animationClass = 'announcement-fade'
        break
      case 'bounce':
        animationClass = 'announcement-bounce'
        break
      default:
        return ''
    }

    return `${animationClass} ${speedClass}`
  }

  // Funciones para el editor de texto enriquecido
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef) {
      handleConfigChange('message', editorRef.innerHTML)
    }
  }

  const handleFormatClick = (format: string) => {
    execCommand(format)
  }

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    setIsTyping(true)
    const newContent = e.currentTarget.innerHTML
    handleConfigChange('message', newContent)

    // Resetear el estado después de un pequeño delay
    setTimeout(() => setIsTyping(false), 100)
  }

  const handleEditorKeyDown = () => {
    setIsTyping(true)
  }

  const handleEditorBlur = () => {
    setIsTyping(false)
  }

  // Helper para renderizar el contenido con la estructura correcta para slide
  const renderAnnouncementContent = (message: string, link: string, linkText: string, animation: string, isSlide: boolean = false) => {
    const content = (
      <>
        <span dangerouslySetInnerHTML={{ __html: message }} />
        {link && linkText && (
          <span className={`${isSlide ? 'ml-8' : 'ml-3'} underline font-medium`}>
            {linkText}
          </span>
        )}
      </>
    )

    if (animation === 'slide') {
      return (
        <span className="slide-content">
          <span className="slide-item">{content}</span>
          <span className="slide-item">{content}</span>
          <span className="slide-item">{content}</span>
          <span className="slide-item">{content}</span>
        </span>
      )
    }

    return content
  }

  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [config, setConfig] = useState<AnnouncementBarConfig>({
    enabled: false,
    message: '',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    link: '',
    linkText: '',
    animation: 'none',
    animationSpeed: 'normal',
    startDate: '',
    endDate: '',
    showOnMobile: true,
    showOnDesktop: true,
    position: 'top'
  })

  // Estado para el editor de texto enriquecido
  const [editorRef, setEditorRef] = useState<HTMLDivElement | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  // Sincronizar contenido del editor solo cuando no se está escribiendo
  useEffect(() => {
    if (editorRef && !isTyping && editorRef.innerHTML !== config.message) {
      editorRef.innerHTML = config.message || ''
    }
  }, [config.message, editorRef, isTyping])

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStore = async () => {
      if (!user?.uid) return

      try {
        const userStore = await getUserStore(user.uid)
        setStore(userStore)
        if (userStore?.announcementBar) {
          setConfig({
            enabled: userStore.announcementBar.enabled || false,
            message: userStore.announcementBar.message || '',
            backgroundColor: userStore.announcementBar.backgroundColor || '#000000',
            textColor: userStore.announcementBar.textColor || '#ffffff',
            link: userStore.announcementBar.link || '',
            linkText: userStore.announcementBar.linkText || '',
            animation: userStore.announcementBar.animation || 'none',
            animationSpeed: userStore.announcementBar.animationSpeed || 'normal',
            startDate: userStore.announcementBar.startDate || '',
            endDate: userStore.announcementBar.endDate || '',
            showOnMobile: userStore.announcementBar.showOnMobile ?? true,
            showOnDesktop: userStore.announcementBar.showOnDesktop ?? true,
            position: userStore.announcementBar.position || 'top'
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

  const handleConfigChange = (field: keyof AnnouncementBarConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!store?.id) return

    setSaving(true)
    try {
      await updateStore(store.id, {
        announcementBar: config
      })
      setStore(prev => prev ? { ...prev, announcementBar: config } : null)
      showToast(tActions('saved'), 'success')
    } catch (error) {
      console.error('Error updating announcement bar:', error)
      showToast(tActions('error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const resetConfig = () => {
    setConfig({
      enabled: false,
      message: '',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      link: '',
      linkText: '',
      animation: 'none',
      animationSpeed: 'normal',
      startDate: '',
      endDate: '',
      showOnMobile: true,
      showOnDesktop: true,
      position: 'top'
    })
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t('title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('description')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuración */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-6 space-y-6">
            <h4 className="text-base font-medium text-gray-900">{t('settings.title')}</h4>

            {/* Toggle para activar/desactivar */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('settings.enabled')}
              </label>
              <button
                type="button"
                onClick={() => handleConfigChange('enabled', !config.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 ${
                  config.enabled ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Editor de mensaje con formato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.message')}
              </label>

              {/* Barra de herramientas de formato */}
              <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 border border-gray-300 rounded-t-md">
                <button
                  type="button"
                  onClick={() => handleFormatClick('bold')}
                  className="p-2 text-gray-700 hover:bg-gray-200 rounded text-sm font-bold border border-gray-300 hover:border-gray-400"
                  title="Negrita"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatClick('italic')}
                  className="p-2 text-gray-700 hover:bg-gray-200 rounded text-sm italic border border-gray-300 hover:border-gray-400"
                  title="Cursiva"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatClick('underline')}
                  className="p-2 text-gray-700 hover:bg-gray-200 rounded text-sm underline border border-gray-300 hover:border-gray-400"
                  title="Subrayado"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatClick('strikeThrough')}
                  className="p-2 text-gray-700 hover:bg-gray-200 rounded text-sm line-through border border-gray-300 hover:border-gray-400"
                  title="Tachado"
                >
                  S
                </button>
                <div className="border-l border-gray-300 h-6 mx-2"></div>
                <span className="text-xs text-gray-500">
                  Selecciona texto y usa los botones para aplicar formato
                </span>
              </div>

              {/* Editor de texto enriquecido */}
              <div
                ref={setEditorRef}
                contentEditable
                onInput={handleEditorInput}
                onKeyDown={handleEditorKeyDown}
                onBlur={handleEditorBlur}
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 border-t-0 rounded-b-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm focus:outline-none"
                style={{ whiteSpace: 'pre-wrap' }}
                data-placeholder={t('settings.messagePlaceholder')}
                suppressContentEditableWarning={true}
              />

              <style jsx>{`
                [contenteditable]:empty:before {
                  content: attr(data-placeholder);
                  color: #9CA3AF;
                  pointer-events: none;
                }
              `}</style>
            </div>

            {/* Colores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.backgroundColor')}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.textColor')}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => handleConfigChange('textColor', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.textColor}
                    onChange={(e) => handleConfigChange('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Enlace opcional */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.link')}
                </label>
                <input
                  type="url"
                  value={config.link}
                  onChange={(e) => handleConfigChange('link', e.target.value)}
                  placeholder={t('settings.linkPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
                />
              </div>

              {config.link && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.linkText')}
                  </label>
                  <input
                    type="text"
                    value={config.linkText}
                    onChange={(e) => handleConfigChange('linkText', e.target.value)}
                    placeholder={t('settings.linkTextPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Animación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.animation')}
                </label>
                <select
                  value={config.animation}
                  onChange={(e) => handleConfigChange('animation', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
                >
                  <option value="none">{t('animations.none')}</option>
                  <option value="slide">{t('animations.slide')}</option>
                  <option value="fade">{t('animations.fade')}</option>
                  <option value="bounce">{t('animations.bounce')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.animationSpeed')}
                </label>
                <select
                  value={config.animationSpeed}
                  onChange={(e) => handleConfigChange('animationSpeed', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
                >
                  <option value="slow">{t('speeds.slow')}</option>
                  <option value="normal">{t('speeds.normal')}</option>
                  <option value="fast">{t('speeds.fast')}</option>
                </select>
              </div>
            </div>

            {/* Fechas de programación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.startDate')}
                </label>
                <input
                  type="date"
                  value={config.startDate}
                  onChange={(e) => handleConfigChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.endDate')}
                </label>
                <input
                  type="date"
                  value={config.endDate}
                  onChange={(e) => handleConfigChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
                />
              </div>
            </div>

            {/* Configuración responsive */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dispositivos
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showOnMobile"
                    checked={config.showOnMobile}
                    onChange={(e) => handleConfigChange('showOnMobile', e.target.checked)}
                    className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-600"
                  />
                  <label htmlFor="showOnMobile" className="ml-2 text-sm text-gray-700">
                    {t('settings.showOnMobile')}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showOnDesktop"
                    checked={config.showOnDesktop}
                    onChange={(e) => handleConfigChange('showOnDesktop', e.target.checked)}
                    className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-600"
                  />
                  <label htmlFor="showOnDesktop" className="ml-2 text-sm text-gray-700">
                    {t('settings.showOnDesktop')}
                  </label>
                </div>
              </div>
            </div>

            {/* Posición */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.position')}
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="positionTop"
                    name="position"
                    value="top"
                    checked={config.position === 'top'}
                    onChange={(e) => handleConfigChange('position', e.target.value)}
                    className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-600"
                  />
                  <label htmlFor="positionTop" className="ml-2 text-sm text-gray-700">
                    {t('settings.positionTop')}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="positionBottom"
                    name="position"
                    value="bottom"
                    checked={config.position === 'bottom'}
                    onChange={(e) => handleConfigChange('position', e.target.value)}
                    className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-600"
                  />
                  <label htmlFor="positionBottom" className="ml-2 text-sm text-gray-700">
                    {t('settings.positionBottom')}
                  </label>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={resetConfig}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Resetear
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 ${
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

        {/* Vista previa */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-6">
            <h4 className="text-base font-medium text-gray-900 mb-4">{t('preview.title')}</h4>
            <p className="text-sm text-gray-600 mb-4">{t('preview.description')}</p>

            {config.enabled && config.message ? (
              <div className="space-y-4">
                {/* Vista previa móvil */}
                {config.showOnMobile && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Móvil</h5>
                    <div className="w-full max-w-xs mx-auto border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      {/* Simulación de pantalla móvil */}
                      <div className="bg-white">
                        {config.position === 'top' && (
                          <div
                            className={`px-4 py-2 text-center text-xs ${getAnimationClasses(config.animation, config.animationSpeed)}`}
                            style={{
                              backgroundColor: config.backgroundColor,
                              color: config.textColor
                            }}
                          >
                            {renderAnnouncementContent(config.message, config.link || '', config.linkText || '', config.animation, true)}
                          </div>
                        )}

                        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center justify-center text-xs text-gray-500">
                          Header
                        </div>

                        {config.position === 'bottom' && (
                          <div
                            className={`px-4 py-2 text-center text-xs ${getAnimationClasses(config.animation, config.animationSpeed)}`}
                            style={{
                              backgroundColor: config.backgroundColor,
                              color: config.textColor
                            }}
                          >
                            {renderAnnouncementContent(config.message, config.link || '', config.linkText || '', config.animation, true)}
                          </div>
                        )}

                        <div className="h-32 bg-white flex items-center justify-center text-xs text-gray-500">
                          Contenido de la tienda
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vista previa desktop */}
                {config.showOnDesktop && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Escritorio</h5>
                    <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      {/* Simulación de pantalla desktop */}
                      <div className="bg-white">
                        {config.position === 'top' && (
                          <div
                            className={`px-6 py-3 text-center text-sm ${getAnimationClasses(config.animation, config.animationSpeed)}`}
                            style={{
                              backgroundColor: config.backgroundColor,
                              color: config.textColor
                            }}
                          >
                            {renderAnnouncementContent(config.message, config.link || '', config.linkText || '', config.animation, false)}
                          </div>
                        )}

                        <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-center text-sm text-gray-500">
                          Header de la tienda
                        </div>

                        {config.position === 'bottom' && (
                          <div
                            className={`px-6 py-3 text-center text-sm ${getAnimationClasses(config.animation, config.animationSpeed)}`}
                            style={{
                              backgroundColor: config.backgroundColor,
                              color: config.textColor
                            }}
                          >
                            {renderAnnouncementContent(config.message, config.link || '', config.linkText || '', config.animation, false)}
                          </div>
                        )}

                        <div className="h-32 bg-white flex items-center justify-center text-sm text-gray-500">
                          Contenido principal de la tienda
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                </svg>
                <p className="mt-2 text-sm">{t('preview.disabled')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  )
}