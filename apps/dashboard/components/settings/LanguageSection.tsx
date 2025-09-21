'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { StoreWithId } from '../../lib/store'

interface LanguageSectionProps {
  store: StoreWithId
  onUpdate: (data: Partial<StoreWithId>) => Promise<boolean>
  saving?: boolean
  showToast: (message: string, type: 'success' | 'error') => void
}

export default function LanguageSection({ store, onUpdate, saving, showToast }: LanguageSectionProps) {
  const t = useTranslations('settings.advanced.checkout')
  const [languageSaving, setLanguageSaving] = useState(false)

  const currentLanguage = store?.advanced?.language || 'es'

  const handleLanguageChange = async (selectedLanguage: 'es' | 'en' | 'pt') => {
    if (languageSaving || selectedLanguage === currentLanguage) return
    
    setLanguageSaving(true)
    try {
      const success = await onUpdate({
        advanced: {
          ...store.advanced,
          language: selectedLanguage
        }
      })
      
      if (success) {
        showToast('Idioma actualizado correctamente', 'success')
      } else {
        showToast('Error al actualizar el idioma', 'error')
      }
    } catch (error) {
      console.error('Error updating language:', error)
      showToast('Error al actualizar el idioma', 'error')
    } finally {
      setLanguageSaving(false)
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-6 py-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{t('language.title')}</h3>
          <p className="mt-1 text-sm text-gray-600">{t('language.description')}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('language.label')}
            </label>
            
            <div className="space-y-3">
              {/* Opción Español */}
              <div 
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  currentLanguage === 'es' 
                    ? 'border-black bg-gray-50 ring-2 ring-black ring-opacity-20' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${languageSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleLanguageChange('es')}
              >
                <input
                  type="radio"
                  name="language"
                  value="es"
                  checked={currentLanguage === 'es'}
                  onChange={() => handleLanguageChange('es')}
                  className="sr-only"
                  disabled={languageSaving}
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  currentLanguage === 'es' ? 'border-black' : 'border-gray-300'
                }`}>
                  {currentLanguage === 'es' && (
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    🇪🇸 {t('language.spanish')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Botones, etiquetas y mensajes del sistema en español
                  </p>
                </div>
              </div>

              {/* Opción Inglés */}
              <div 
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  currentLanguage === 'en' 
                    ? 'border-black bg-gray-50 ring-2 ring-black ring-opacity-20' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${languageSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={currentLanguage === 'en'}
                  onChange={() => handleLanguageChange('en')}
                  className="sr-only"
                  disabled={languageSaving}
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  currentLanguage === 'en' ? 'border-black' : 'border-gray-300'
                }`}>
                  {currentLanguage === 'en' && (
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    🇺🇸 {t('language.english')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Buttons, labels and system messages in English
                  </p>
                </div>
              </div>

              {/* Opción Portugués */}
              <div 
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  currentLanguage === 'pt' 
                    ? 'border-black bg-gray-50 ring-2 ring-black ring-opacity-20' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${languageSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleLanguageChange('pt')}
              >
                <input
                  type="radio"
                  name="language"
                  value="pt"
                  checked={currentLanguage === 'pt'}
                  onChange={() => handleLanguageChange('pt')}
                  className="sr-only"
                  disabled={languageSaving}
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  currentLanguage === 'pt' ? 'border-black' : 'border-gray-300'
                }`}>
                  {currentLanguage === 'pt' && (
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    🇧🇷 {t('language.portuguese')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Botões, etiquetas e mensagens do sistema em português
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              {t('language.hint')}
            </p>
          </div>


          {/* Indicador de carga */}
          {languageSaving && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-black rounded-full"></div>
              <span>Guardando idioma...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
