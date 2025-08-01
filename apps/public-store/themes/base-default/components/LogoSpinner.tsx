'use client'

import { Tienda } from '../../../lib/types'

interface LogoSpinnerProps {
  tienda: Tienda
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

const LogoSpinner = ({ 
  tienda, 
  size = 'md', 
  message,
  className = '' 
}: LogoSpinnerProps) => {
  const sizeClass = sizeClasses[size]
  
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        {/* Logo circular con spinner */}
        <div className={`${sizeClass} relative`}>
          {/* Spinner ring */}
          <div className={`absolute inset-0 ${sizeClass} border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin`}></div>
          
          {/* Logo */}
          <div className={`absolute inset-1 ${sizeClass === 'w-8 h-8' ? 'w-6 h-6' : sizeClass === 'w-12 h-12' ? 'w-10 h-10' : sizeClass === 'w-16 h-16' ? 'w-14 h-14' : 'w-20 h-20'} rounded-full overflow-hidden flex items-center justify-center bg-white`}>
            {tienda?.logoUrl ? (
              <img
                src={tienda.logoUrl}
                alt={`${tienda.storeName} logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Fallback letter */}
            <div 
              className={`w-full h-full bg-neutral-900 rounded-full flex items-center justify-center ${tienda?.logoUrl ? 'hidden' : 'flex'}`}
              style={{ display: tienda?.logoUrl ? 'none' : 'flex' }}
            >
              <span className={`text-white font-bold ${
                size === 'sm' ? 'text-xs' : 
                size === 'md' ? 'text-sm' : 
                size === 'lg' ? 'text-base' : 
                'text-lg'
              }`}>
                {tienda?.storeName?.charAt(0) || 'S'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mensaje opcional */}
      {message && (
        <p className={`text-neutral-600 font-light text-center ${
          size === 'sm' ? 'text-xs' : 
          size === 'md' ? 'text-sm' : 
          'text-base'
        }`}>
          {message}
        </p>
      )}
    </div>
  )
}

export default LogoSpinner