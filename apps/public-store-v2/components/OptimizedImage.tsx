/**
 * 🚀 OPTIMIZACIÓN FASE 3: Componente de imagen optimizado
 * Usa Next/Image con placeholders blur y lazy loading automático
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toCloudinaryBlurPlaceholder } from '../lib/images';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  fill = false,
  sizes,
  quality = 85
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generar placeholder blur automáticamente
  const blurDataURL = toCloudinaryBlurPlaceholder(src);

  // Fallback para imágenes que no cargan
  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
      >
        <span className="text-gray-400 text-sm">Sin imagen</span>
      </div>
    );
  }

  const commonProps = {
    src,
    alt,
    className: `${className} ${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`,
    onLoad: () => setIsLoading(false),
    onError: () => setHasError(true),
    quality,
    ...(blurDataURL ? {
      placeholder: 'blur' as const,
      blurDataURL
    } : {}),
    ...(sizes ? { sizes } : {}),
    ...(priority ? { priority: true } : { loading: 'lazy' as const })
  };

  if (fill) {
    return <Image {...commonProps} fill alt={alt} />;
  }

  return <Image {...commonProps} width={width!} height={height!} alt={alt} />;
}

/**
 * Componente especializado para imágenes de productos
 * Con aspect ratio 1:1 y optimizaciones específicas
 */
export function ProductImage({
  src,
  alt,
  size = 400,
  priority = false,
  className = ''
}: {
  src: string;
  alt: string;
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={`aspect-square object-cover ${className}`}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      quality={85}
    />
  );
}

/**
 * Componente para imágenes hero/banner
 * Optimizado para full width con priority loading
 */
export function HeroImage({
  src,
  alt,
  className = ''
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority
      className={`object-cover ${className}`}
      sizes="100vw"
      quality={90}
    />
  );
}
