import { useState, useEffect, useRef, useCallback } from 'react'

interface CarouselImage {
  publicId: string
  url: string
  order: number
}

interface SimpleCarouselProps {
  images: CarouselImage[]
}

export function SimpleCarousel({ images }: SimpleCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [touchEndY, setTouchEndY] = useState<number | null>(null)
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(null)
  
  const carouselRef = useRef<HTMLDivElement>(null)

  // Autoplay del carrusel
  useEffect(() => {
    if (!isAutoplay || !images?.length) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => 
        prev + 1 >= images.length ? 0 : prev + 1
      );
    }, 4000); // Cambiar cada 4 segundos

    return () => clearInterval(interval);
  }, [isAutoplay, images?.length]);

  // Funciones del carrusel
  const nextSlide = useCallback(() => {
    setIsAutoplay(false); // Pausar autoplay cuando el usuario interactúa
    setCurrentSlide(prev => 
      prev + 1 >= images.length ? 0 : prev + 1
    );
    // Reactivar autoplay después de 10 segundos
    setTimeout(() => setIsAutoplay(true), 10000);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setIsAutoplay(false);
    setCurrentSlide(prev => 
      prev - 1 < 0 ? images.length - 1 : prev - 1
    );
    setTimeout(() => setIsAutoplay(true), 10000);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setIsAutoplay(false);
    setCurrentSlide(index);
    setTimeout(() => setIsAutoplay(true), 10000);
  };

  // Funciones para el touch en móvil con prevención de scroll conflictivo
  const minSwipeDistance = 50;
  const directionThreshold = 30; // Umbral para detectar dirección

  const onTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null);
    setTouchEndY(null);
    setIsHorizontalSwipe(null);
    setTouchStart(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    setTouchEnd(currentX);
    setTouchEndY(currentY);

    // Detectar dirección del swipe una sola vez al inicio del movimento
    if (isHorizontalSwipe === null && touchStart !== null && touchStartY !== null) {
      const deltaX = Math.abs(currentX - touchStart);
      const deltaY = Math.abs(currentY - touchStartY);
      
      // Si el movimiento horizontal es mayor que el vertical por el threshold
      if (deltaX > deltaY && deltaX > directionThreshold) {
        setIsHorizontalSwipe(true);
        console.log('🔄 Swipe horizontal detectado - bloqueando scroll vertical');
      } else if (deltaY > deltaX && deltaY > directionThreshold) {
        setIsHorizontalSwipe(false);
        console.log('🔄 Swipe vertical detectado - permitiendo scroll normal');
      }
    }

    // Si es swipe horizontal, prevenir scroll vertical
    if (isHorizontalSwipe === true) {
      e.preventDefault();
    }
  }, [isHorizontalSwipe, touchStart, touchStartY, directionThreshold]);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || isHorizontalSwipe !== true) {
      // Resetear estados
      setIsHorizontalSwipe(null);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    // Resetear estados
    setIsHorizontalSwipe(null);
  }, [touchStart, touchEnd, isHorizontalSwipe, minSwipeDistance, nextSlide, prevSlide]);

  // Registrar event listeners nativos para poder usar preventDefault
  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return;

    // Registrar listeners con passive: false para poder prevenir el default
    element.addEventListener('touchstart', onTouchStart, { passive: false });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  // Manejo de mouse wheel para desktop
  const onWheel = (e: React.WheelEvent) => {
    // Solo actuar si hay scroll horizontal significativo
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
      e.preventDefault(); // Prevenir scroll vertical
      
      // Debounce para evitar múltiples cambios rápidos
      if (Date.now() - (window as any).lastWheelTime < 300) return;
      (window as any).lastWheelTime = Date.now();
      
      if (e.deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      
      console.log('🔄 Mouse wheel horizontal detectado - navegando carrusel');
    }
  };

  if (!images?.length) return null;

  return (
    <section className="nbd-carousel-section">
      <div className="nbd-carousel-container">
        <div 
          ref={carouselRef}
          className="nbd-carousel-wrapper"
          onWheel={onWheel}
        >
          {images
            .sort((a, b) => a.order - b.order)
            .map((image, index) => (
            <div 
              key={image.publicId} 
              className="nbd-carousel-slide"
              style={{
                transform: `translateX(${(index - currentSlide) * 100}%)`
              }}
            >
              <img
                src={image.url}
                alt={`Promoción ${index + 1}`}
                className="nbd-carousel-image"
              />
            </div>
          ))}
        </div>

        <div className="nbd-carousel-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`nbd-carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}