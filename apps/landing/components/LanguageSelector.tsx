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

export default function LanguageSelector() {
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
        aria-label="Select language"
      >
        <ReactCountryFlag
          countryCode={currentLanguage.countryCode}
          svg
          style={{
            width: '1.2em',
            height: '1.2em',
          }}
        />
        <span className="font-medium hidden sm:block">{currentLanguage.name}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 sm:left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                currentLocale === language.code 
                  ? 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500' 
                  : 'text-gray-700'
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
              <span className="font-medium">{language.name}</span>
              {currentLocale === language.code && (
                <svg className="w-4 h-4 ml-auto text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
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