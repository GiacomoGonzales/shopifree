'use client'

import { useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { useStore } from '../../../lib/hooks/useStore'
import { updateStoreField } from '../../../lib/store'
import { catalogThemes, DEFAULT_THEME_ID } from '../../../lib/themes/themes-list'

// Previews de cada tema
const themePreviewComponents: Record<string, React.FC> = {
  minimal: () => (
    <div className="h-full bg-white rounded-lg overflow-hidden flex flex-col">
      <div className="h-6 border-b border-gray-100 flex items-center justify-between px-4">
        <div className="w-12 h-2 bg-gray-800 rounded"></div>
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="py-4 flex flex-col items-center">
        <div className="w-16 h-2 bg-gray-800 rounded mb-1"></div>
        <div className="w-10 h-1.5 bg-gray-200 rounded"></div>
      </div>
      <div className="flex-1 px-3 grid grid-cols-4 gap-2">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="flex flex-col">
            <div className="bg-gray-100 aspect-square rounded mb-1"></div>
            <div className="w-full h-1 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  ),
  boutique: () => (
    <div className="h-full bg-stone-900 rounded-lg overflow-hidden flex flex-col">
      <div className="h-8 flex items-center justify-between px-4">
        <div className="w-16 h-2 bg-stone-600 rounded"></div>
        <div className="w-4 h-4 bg-stone-700 rounded"></div>
      </div>
      <div className="py-4 flex flex-col items-center">
        <div className="w-20 h-3 bg-stone-500 rounded mb-1"></div>
        <div className="w-12 h-1.5 bg-stone-700 rounded"></div>
      </div>
      <div className="flex-1 px-3 grid grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="flex flex-col">
            <div className="bg-stone-800 aspect-[3/4] rounded mb-1"></div>
            <div className="w-full h-1 bg-stone-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  ),
  bold: () => (
    <div className="h-full bg-black rounded-lg overflow-hidden flex flex-col">
      <div className="h-6 border-b border-white/10 flex items-center justify-between px-4">
        <div className="w-14 h-2 bg-yellow-400 rounded"></div>
        <div className="w-4 h-4 bg-yellow-400 rounded"></div>
      </div>
      <div className="py-4 flex flex-col items-center">
        <div className="w-24 h-4 bg-yellow-400 rounded mb-1"></div>
        <div className="w-14 h-1.5 bg-white/20 rounded"></div>
      </div>
      <div className="flex-1 px-3 grid grid-cols-4 gap-2">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="bg-white/10 aspect-square rounded"></div>
        ))}
      </div>
    </div>
  ),
  fresh: () => (
    <div className="h-full bg-gradient-to-b from-emerald-50 to-white rounded-lg overflow-hidden flex flex-col">
      <div className="h-6 bg-white/80 flex items-center justify-between px-4">
        <div className="w-12 h-2 bg-emerald-500 rounded"></div>
        <div className="w-5 h-5 bg-emerald-100 rounded-full"></div>
      </div>
      <div className="py-3 flex flex-col items-center">
        <div className="px-2 py-0.5 bg-emerald-100 rounded-full mb-1">
          <div className="w-8 h-1 bg-emerald-400 rounded"></div>
        </div>
        <div className="w-14 h-2 bg-gray-800 rounded"></div>
      </div>
      <div className="flex-1 px-3 grid grid-cols-3 gap-2">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-emerald-50 aspect-square"></div>
            <div className="p-1">
              <div className="w-full h-1 bg-gray-200 rounded mb-0.5"></div>
              <div className="w-6 h-1 bg-emerald-400 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  neon: () => (
    <div className="h-full bg-[#0a0a0f] rounded-lg overflow-hidden flex flex-col relative">
      <div className="absolute top-4 left-4 w-16 h-16 bg-[#00ff88] rounded-full blur-xl opacity-30"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 bg-[#ff00ff] rounded-full blur-xl opacity-20"></div>
      <div className="h-6 flex items-center justify-between px-4 relative z-10">
        <div className="w-14 h-2 bg-[#00ff88] rounded" style={{boxShadow: '0 0 10px #00ff88'}}></div>
        <div className="w-4 h-4 border border-[#00ff88] rounded"></div>
      </div>
      <div className="py-4 flex flex-col items-center relative z-10">
        <div className="w-20 h-3 bg-gradient-to-r from-[#00ff88] via-[#00ffff] to-[#ff00ff] rounded mb-1"></div>
        <div className="w-10 h-1 bg-white/20 rounded"></div>
      </div>
      <div className="flex-1 px-3 grid grid-cols-4 gap-2 relative z-10">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="bg-white/5 aspect-square rounded border border-white/10"></div>
        ))}
      </div>
    </div>
  ),
  luxe: () => (
    <div className="h-full bg-[#0C0C0C] rounded-lg overflow-hidden flex flex-col">
      <div className="h-6 flex items-center justify-between px-4">
        <div className="w-16 h-1.5 bg-[#C9A962] rounded"></div>
        <div className="w-4 h-4 border border-[#C9A962]/50 rounded"></div>
      </div>
      <div className="py-6 flex flex-col items-center">
        <div className="w-8 h-px bg-[#C9A962] mb-3"></div>
        <div className="w-24 h-3 bg-white/80 rounded mb-1"></div>
        <div className="w-8 h-px bg-[#C9A962] mt-3"></div>
      </div>
      <div className="flex-1 px-4 grid grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="flex flex-col">
            <div className="bg-white/5 aspect-[3/4] rounded mb-1 border border-[#C9A962]/20"></div>
            <div className="w-full h-1 bg-white/20 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  ),
  craft: () => (
    <div className="h-full bg-[#FAF5F0] rounded-lg overflow-hidden flex flex-col">
      <div className="h-6 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#B45309]"></div>
          <div className="w-12 h-2 bg-[#B45309] rounded"></div>
        </div>
        <div className="w-4 h-4 rounded-full border-2 border-[#E8DDD4]"></div>
      </div>
      <div className="py-3 flex flex-col items-center">
        <div className="w-6 h-px bg-[#B45309] mb-2"></div>
        <div className="w-16 h-2 bg-[#3D2314] rounded"></div>
      </div>
      <div className="flex-1 px-3 grid grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-xl border-2 border-[#E8DDD4] overflow-hidden">
            <div className="bg-[#E8DDD4] aspect-square"></div>
            <div className="p-1.5">
              <div className="w-full h-1 bg-[#3D2314]/20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  pop: () => (
    <div className="h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-lg overflow-hidden flex flex-col">
      <div className="h-6 flex items-center justify-between px-4">
        <div className="w-14 h-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded"></div>
        <div className="w-5 h-5 bg-white rounded-xl shadow"></div>
      </div>
      <div className="py-3 flex flex-col items-center">
        <div className="w-20 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded mb-1"></div>
        <div className="flex gap-1 mt-1">
          {['#FF6B9D', '#A855F7', '#3B82F6', '#FBBF24'].map((c, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{backgroundColor: c}}></div>
          ))}
        </div>
      </div>
      <div className="flex-1 px-3 grid grid-cols-3 gap-2">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="aspect-square" style={{backgroundColor: ['#FF6B9D20', '#A855F720', '#3B82F620', '#FBBF2420', '#10B98120', '#F9731620'][i-1]}}></div>
            <div className="p-1">
              <div className="w-full h-1.5 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
}

export default function AppearancePage() {
  const { store, loading: storeLoading, mutate } = useStore()
  const [saving, setSaving] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const currentTheme = store?.theme || DEFAULT_THEME_ID

  const handleSelectTheme = async (themeId: string) => {
    if (!store?.id || themeId === currentTheme) return

    setSelectedTheme(themeId)
    setSaving(true)
    setSuccess(false)

    try {
      await updateStoreField(store.id, 'theme', themeId)
      mutate({ ...store, theme: themeId })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating theme:', error)
    } finally {
      setSaving(false)
      setSelectedTheme(null)
    }
  }

  if (storeLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  const catalogUrl = store?.subdomain ? `${store.subdomain}.shopifree.app` : ''

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-light text-gray-900">Apariencia</h1>
            <p className="text-gray-500 mt-1">Elige el estilo de tu catalogo</p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-700">Tema actualizado</span>
              <a
                href={`http://localhost:3005/${store?.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                Ver catalogo
              </a>
            </div>
          )}

          {/* Theme Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogThemes.map((theme) => {
              const isActive = currentTheme === theme.id
              const isSelecting = selectedTheme === theme.id && saving
              const PreviewComponent = themePreviewComponents[theme.id]

              return (
                <div
                  key={theme.id}
                  className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                    isActive
                      ? 'border-emerald-500 ring-2 ring-emerald-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Preview */}
                  <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden p-3">
                    {PreviewComponent && <PreviewComponent />}

                    {/* Active badge */}
                    {isActive && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Activo
                      </div>
                    )}

                    {/* Recommended badge */}
                    {theme.recommended && !isActive && (
                      <div className="absolute top-3 right-3 bg-gray-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Recomendado
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{theme.id}</h3>
                    <p className="text-sm text-gray-500 mt-1">{theme.description}</p>

                    {/* Color preview */}
                    <div className="flex items-center gap-2 mt-4 mb-4">
                      <span className="text-xs text-gray-400">Colores:</span>
                      <div
                        className="w-5 h-5 rounded-full border border-gray-200"
                        style={{ backgroundColor: theme.colors?.primary }}
                      ></div>
                      <div
                        className="w-5 h-5 rounded-full border border-gray-200"
                        style={{ backgroundColor: theme.colors?.secondary }}
                      ></div>
                    </div>

                    {/* Action button */}
                    {isActive ? (
                      <button
                        disabled
                        className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-medium cursor-not-allowed"
                      >
                        Tema actual
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectTheme(theme.id)}
                        disabled={saving}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
                      >
                        {isSelecting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Aplicando...
                          </>
                        ) : (
                          'Usar este tema'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Info banner */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Todos los temas incluyen</h3>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>Pedidos directos por WhatsApp</li>
                  <li>Diseño optimizado para moviles</li>
                  <li>Carga ultra rapida</li>
                  <li>Sin comisiones por venta</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
