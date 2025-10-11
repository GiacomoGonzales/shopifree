'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import ReactCountryFlag from 'react-country-flag'

const languages = [
  {
    code: 'es',
    name: 'Español',
    countryCode: 'ES'
  },
  {
    code: 'en',
    name: 'English',
    countryCode: 'GB'
  }
]

export default function LanguageSelector({ variant = 'default' }: { variant?: 'default' | 'sidebar' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (langCode: string) => {
    // Replace the current locale in the pathname
    const segments = pathname.split('/')
    segments[1] = langCode // Replace locale segment
    const newPathname = segments.join('/')
    
    router.push(newPathname)
    setIsOpen(false)
  }

  if (variant === 'sidebar') {
    return (
      <div className="relative w-full" ref={dropdownRef}>
        {/* Trigger Button - Sidebar Version */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label="Select language"
        >
          <div className="flex items-center space-x-3">
            <ReactCountryFlag
              countryCode={currentLanguage.countryCode}
              svg
              style={{
                width: '1.8em',
                height: '1.8em',
              }}
            />
            <span className="text-sm font-medium">{currentLanguage.name}</span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform duration-200 drop-shadow-lg ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu - Sidebar */}
        {isOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg z-50 py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center justify-between space-x-3 px-4 py-3 hover:bg-white/10 focus:bg-white/10 transition-colors duration-150 focus:outline-none ${
                  currentLocale === language.code
                    ? 'bg-white/15'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ReactCountryFlag
                    countryCode={language.countryCode}
                    svg
                    style={{
                      width: '1.5em',
                      height: '1.5em',
                    }}
                  />
                  <span className="text-white text-sm font-medium">{language.name}</span>
                </div>
                {currentLocale === language.code && (
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - Default Version */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-white hover:text-emerald-400 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
        aria-label="Select language"
      >
        <ReactCountryFlag
          countryCode={currentLanguage.countryCode}
          svg
          style={{
            width: '1.5em',
            height: '1.5em',
          }}
        />
        <svg
          className={`w-4 h-4 transition-transform duration-200 drop-shadow-lg ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Default */}
      {isOpen && (
        <div className="absolute top-full right-0 sm:left-0 mt-1 w-32 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg z-50 py-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center space-x-2 px-3 py-2 hover:bg-white/10 focus:bg-white/10 transition-colors duration-150 rounded-md mx-1 focus:outline-none ${
                currentLocale === language.code
                  ? 'bg-white/15'
                  : ''
              }`}
            >
              <ReactCountryFlag
                countryCode={language.countryCode}
                svg
                style={{
                  width: '1.2em',
                  height: '1.2em',
                }}
              />
              <span className="text-white text-xs font-medium">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}