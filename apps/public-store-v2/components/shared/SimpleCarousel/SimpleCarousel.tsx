import { useState, useEffect } from 'react'

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
  const nextSlide = () => {
    setIsAutoplay(false); // Pausar autoplay cuando el usuario interactúa
    setCurrentSlide(prev => 
      prev + 1 >= images.length ? 0 : prev + 1
    );
    // Reactivar autoplay después de 10 segundos
    setTimeout(() => setIsAutoplay(true), 10000);
  };

  const prevSlide = () => {
    setIsAutoplay(false);
    setCurrentSlide(prev => 
      prev - 1 < 0 ? images.length - 1 : prev - 1
    );
    setTimeout(() => setIsAutoplay(true), 10000);
  };

  const goToSlide = (index: number) => {
    setIsAutoplay(false);
    setCurrentSlide(index);
    setTimeout(() => setIsAutoplay(true), 10000);
  };

  // Funciones para el touch en móvil
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  if (!images?.length) return null;

  return (
    <section className="nbd-carousel-section">
      <div className="nbd-carousel-container">
        <div 
          className="nbd-carousel-wrapper"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
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