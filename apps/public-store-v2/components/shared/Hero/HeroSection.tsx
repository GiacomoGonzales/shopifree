import { useRef, useEffect } from 'react'

interface HeroSectionProps {
  storeName: string
  description?: string
  heroMediaUrl?: string
  heroMediaType?: 'image' | 'video' | null
  texts: {
    exploreProducts: string
    viewCategories: string
  }
  toCloudinarySquare: (url: string, size: number) => string
}

export function HeroSection({ 
  storeName, 
  description, 
  heroMediaUrl, 
  heroMediaType, 
  texts,
  toCloudinarySquare 
}: HeroSectionProps) {
  const heroVideoRef = useRef<HTMLVideoElement>(null)

  // Force hero video autoplay - Enhanced for Safari iOS
  useEffect(() => {
    if (heroVideoRef.current && heroMediaType === 'video') {
      const video = heroVideoRef.current
      
      // iOS Safari specific setup
      const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      
      if (isIOSSafari) {
        video.setAttribute('webkit-playsinline', 'true')
        video.setAttribute('playsinline', 'true')
      }
      
      // Force play attempt
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Video autoplay failed:', error)
        })
      }
    }
  }, [heroMediaType])

  return (
    <section className="nbd-hero">
      <div className="nbd-hero-container">
        <div className="nbd-hero-content">
          <div className="nbd-hero-text">
            <h1 className="nbd-hero-title">
              {storeName}
            </h1>
            {description && (
              <p className="nbd-hero-description">
                {description}
              </p>
            )}
            <div className="nbd-hero-actions">
              <a href="#productos" className="nbd-btn nbd-btn--primary">
                <span>{texts.exploreProducts}</span>
                <svg className="nbd-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#categorias" className="nbd-btn nbd-btn--secondary">
                {texts.viewCategories}
              </a>
            </div>
          </div>
          
          <div className="nbd-hero-visual">
            {(() => {
              if (heroMediaUrl) {
                return (
                  <div className="nbd-hero-media">
                    {heroMediaType === 'video' ? (
                      <video
                        ref={heroVideoRef}
                        src={heroMediaUrl}
                        className="nbd-hero-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        webkit-playsinline="true"
                        disablePictureInPicture
                        controls={false}
                        controlsList="nodownload nofullscreen noremoteplayback"
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={toCloudinarySquare(heroMediaUrl, 1200)}
                        alt={storeName || 'Hero'}
                        className="nbd-hero-img"
                      />
                    )}
                    <div className="nbd-hero-image-overlay"></div>
                  </div>
                )
              } else {
                return (
                  <div className="nbd-hero-placeholder flex items-center justify-center">
                    <div className="nbd-placeholder-grid">
                      <div className="nbd-placeholder-item"></div>
                      <div className="nbd-placeholder-item"></div>
                      <div className="nbd-placeholder-item"></div>
                      <div className="nbd-placeholder-item"></div>
                    </div>
                  </div>
                )
              }
            })()}
          </div>
        </div>
      </div>
    </section>
  )
}