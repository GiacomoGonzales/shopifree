import { useRef } from 'react'

interface Brand {
  id: string
  name: string
  slug: string
  image?: string
}

interface BrandsCarouselProps {
  brands: Brand[]
  isMobile: boolean
  texts: {
    brandsTitle: string
    brandSubtitle: string
  }
  buildUrl: (path: string) => string
  toCloudinarySquare: (url: string, size: number) => string
}

export function BrandsCarousel({
  brands,
  isMobile,
  texts,
  buildUrl,
  toCloudinarySquare
}: BrandsCarouselProps) {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isJumpingRef = useRef(false)

  if (!brands || brands.length === 0) return null

  const handleScroll = isMobile ? (e: React.UIEvent<HTMLDivElement>) => {
    // Evitar loops infinitos durante saltos
    if (isJumpingRef.current) return
    
    const container = e.currentTarget
    const scrollLeft = container.scrollLeft
    const scrollWidth = container.scrollWidth
    const clientWidth = container.clientWidth
    const maxScroll = scrollWidth - clientWidth
    
    // Calcular el ancho de un conjunto completo de marcas
    const singleSetWidth = maxScroll / 3 // 4 copias = 3 intervalos
    
    // Limpiar timeout anterior
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    // Usar timeout para hacer salto después de que el usuario pare de hacer scroll
    scrollTimeoutRef.current = setTimeout(() => {
      // Saltar solo si estamos muy cerca de los límites
      if (scrollLeft >= singleSetWidth * 2.9) { // 90% del tercer conjunto
        isJumpingRef.current = true
        // Deshabilitar scroll suave temporalmente para salto instantáneo
        const originalScrollBehavior = container.style.scrollBehavior
        container.style.scrollBehavior = 'auto'
        
        requestAnimationFrame(() => {
          container.scrollLeft = singleSetWidth * 0.9 // Equivalente en el primer conjunto
          
          // Restaurar scroll suave después del salto
          requestAnimationFrame(() => {
            container.style.scrollBehavior = originalScrollBehavior
            isJumpingRef.current = false
          })
        })
      }
      else if (scrollLeft <= singleSetWidth * 0.1) { // 10% del primer conjunto
        isJumpingRef.current = true
        // Deshabilitar scroll suave temporalmente para salto instantáneo
        const originalScrollBehavior = container.style.scrollBehavior
        container.style.scrollBehavior = 'auto'
        
        requestAnimationFrame(() => {
          container.scrollLeft = singleSetWidth * 2.1 // Equivalente en el tercer conjunto
          
          // Restaurar scroll suave después del salto
          requestAnimationFrame(() => {
            container.style.scrollBehavior = originalScrollBehavior
            isJumpingRef.current = false
          })
        })
      }
    }, 100) // Esperar 100ms después de que pare el scroll
  } : undefined

  return (
    <section className="nbd-brands-carousel">
      <div className="nbd-container">
        <div className="nbd-section-header">
          <h2 className="nbd-section-title">{texts.brandsTitle}</h2>
          <p className="nbd-section-subtitle">
            {texts.brandSubtitle}
          </p>
        </div>
        
        <div 
          className="nbd-brands-container"
          onScroll={handleScroll}
        >
          <div className="nbd-brands-track" 
               style={{ 
                   '--brands-count': brands.length,
                   '--animation-duration': `${brands.length * 4}s`
               } as React.CSSProperties}>
            {/* Duplicar las marcas: 4x para ambos para que funcione con translateX(-50%) */}
            {[...brands, ...brands, ...brands, ...brands].map((brand, index) => (
              <a 
                key={`${brand.id}-${index}`} 
                href={buildUrl(`/marca/${brand.slug}`)}
                className="nbd-brand-item"
              >
                {brand.image ? (
                  <img
                    src={toCloudinarySquare(brand.image, 400)}
                    alt={brand.name}
                    className="nbd-brand-image"
                    loading="lazy"
                    onError={(e) => {
                      // Si falla la imagen, mostrar solo el nombre
                      const target = e.currentTarget
                      const parent = target.parentElement
                      if (parent) {
                        target.style.display = 'none'
                        parent.innerHTML = `<div class="nbd-brand-fallback">${brand.name}</div>`
                      }
                    }}
                  />
                ) : (
                  <div className="nbd-brand-fallback">
                    {brand.name}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}