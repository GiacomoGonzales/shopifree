'use client';

import { useState, useEffect } from 'react';
import { toCloudinaryBlurPlaceholder } from '../../../lib/images';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export function ProgressiveImage({
  src,
  alt,
  className = '',
  sizes,
  priority = false,
  onLoad,
  onError
}: ProgressiveImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // Generar placeholder blur
  const placeholderSrc = toCloudinaryBlurPlaceholder(src);

  useEffect(() => {
    // Reset state cuando cambia la imagen
    setImageLoaded(false);
    setImageFailed(false);
  }, [src]);

  const handleMainImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleMainImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageFailed(true);
    onError?.(e);
  };

  return (
    <div className={`progressive-image ${className}`}>
      {/* Placeholder borroso - se muestra inmediatamente */}
      {placeholderSrc && !imageFailed && (
        <img
          src={placeholderSrc}
          alt=""
          className={`progressive-image-placeholder ${imageLoaded ? 'progressive-image-placeholder--hidden' : ''}`}
          loading="eager" // Cargar inmediatamente
          decoding="async"
        />
      )}

      {/* Imagen principal - se muestra cuando termina de cargar */}
      {!imageFailed && (
        <img
          src={src}
          alt={alt}
          className={`progressive-image-main ${imageLoaded ? 'progressive-image-main--loaded' : ''}`}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleMainImageLoad}
          onError={handleMainImageError}
        />
      )}

      {/* Fallback si la imagen falla */}
      {imageFailed && (
        <div className="progressive-image-fallback">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        </div>
      )}
    </div>
  );
}