'use client'

import React, { useState, useEffect, useRef } from 'react'

interface HeroCarouselProps {
  images: string[]
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  if (!images || images.length === 0) {
    return null
  }

  // Autoplay functionality
  useEffect(() => {
    if (images.length <= 1 || !isAutoPlaying) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000) // Change image every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [images.length, isAutoPlaying])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && images.length > 1) {
      goToNext()
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevious()
    }
  }

  // Pause autoplay on hover/touch
  const handleMouseEnter = () => {
    setIsAutoPlaying(false)
  }

  const handleMouseLeave = () => {
    setIsAutoPlaying(true)
  }

  // Si solo hay una imagen, la mostramos sin la funcionalidad de carrusel.
  if (images.length === 1) {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        <div className="w-full h-[200px] xs:h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden rounded-lg sm:rounded-xl shadow-lg">
          <img
            src={images[0]}
            alt="Hero image"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      </div>
    )
  }

  // Si hay más de una imagen, renderizamos el carrusel completo.
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
      <div 
        className="w-full h-[200px] xs:h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden rounded-lg sm:rounded-xl shadow-lg relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Contenedor de imágenes con overflow hidden para evitar espacios */}
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full w-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((url, index) => (
            <div
              key={index}
              className="min-w-full h-full flex-shrink-0 relative"
            >
              <img
                src={url}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Botones de navegación - Solo visible en hover en desktop */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-60 text-white p-1.5 sm:p-2 rounded-full transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 md:opacity-100"
          aria-label="Imagen anterior"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-60 text-white p-1.5 sm:p-2 rounded-full transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 md:opacity-100"
          aria-label="Imagen siguiente"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicadores de posición */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white shadow-lg'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-70'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>

        {/* Indicador de autoplay - Solo visible en desktop */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 hidden md:block">
          <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
            isAutoPlaying ? 'bg-green-400' : 'bg-gray-400'
          }`} />
        </div>

        {/* Contador de imágenes - Solo visible en móvil */}
        <div className="absolute top-2 right-2 md:hidden bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Instrucciones de swipe para móvil */}
      <div className="md:hidden text-center mt-2 text-xs text-gray-500">
        Desliza para navegar
      </div>
    </div>
  )
} 