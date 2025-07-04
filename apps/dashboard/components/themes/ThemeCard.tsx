import Image from 'next/image'
import { Theme } from '../../lib/themes/theme-types'

interface ThemeCardProps {
  theme: Theme
  isSelected: boolean
  onSelect: (themeId: string) => void
}

export default function ThemeCard({ theme, isSelected, onSelect }: ThemeCardProps) {
  return (
    <div
      className={`
        relative rounded-lg border-2 transition-all cursor-pointer
        ${isSelected 
          ? 'border-gray-900 ring-2 ring-gray-900 ring-opacity-50' 
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
      onClick={() => onSelect(theme.id)}
    >
      {/* Preview Image */}
      <div className="relative h-48 w-full rounded-t-lg overflow-hidden">
        <Image
          src={theme.preview}
          alt={`Preview de ${theme.nombre}`}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {theme.nombre}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {theme.descripcion}
            </p>
          </div>

          {/* Selected indicator */}
          {isSelected && (
            <div className="ml-2 flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Activo
              </span>
            </div>
          )}
        </div>

        {/* Features list if available */}
        {theme.features && theme.features.length > 0 && (
          <div className="mt-4">
            <ul className="space-y-1">
              {theme.features.map((feature, index) => (
                <li key={index} className="text-xs text-gray-500 flex items-center">
                  <svg className="h-3 w-3 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
} 