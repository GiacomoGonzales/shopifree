"use client";

import { useEffect, useState } from 'react';
import { getStoreIdBySubdomain, getStorePrimaryLocale } from '../../../lib/store';
import { getProduct, getProductBySlug, getStoreProducts, PublicProduct } from '../../../lib/products';
import { toCloudinarySquare } from '../../../lib/images';
import { formatPrice } from '../../../lib/currency';
import Layout from '../../../themes/new-base-default/Layout';
import { getStoreBasicInfo, StoreBasicInfo } from '../../../lib/store';
import { getStoreCategories, Category } from '../../../lib/categories';
import { useCart } from '../../../lib/cart-context';
import ProductVariantSelector from '../../../components/ProductVariantSelector';

// Helper function para optimizar URLs de video de Cloudinary
function optimizeCloudinaryVideo(url: string): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  // Si ya tiene transformaciones, devolverlo tal como está
  if (url.includes('/video/upload/') && !url.includes('/video/upload/v')) {
    // Agregar transformaciones básicas para mejor rendimiento
    return url.replace('/video/upload/', '/video/upload/q_auto,f_auto,br_800k,w_900,h_900,c_limit/');
  }
  
  return url;
}

type Props = {
  storeSubdomain: string;
  productSlug: string;
};

export default function ProductDetail({ storeSubdomain, productSlug }: Props) {
  const [storeId, setStoreId] = useState<string | null>(null);

  // Función para detectar si estamos en un dominio personalizado
  const isCustomDomain = () => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    return !host.endsWith('shopifree.app') && !host.endsWith('localhost') && host !== 'localhost';
  };
  
  // 🚀 NUEVA FUNCIÓN: Construir URLs sin prefijo de idioma (single locale mode)
  const buildUrl = (path: string) => {
    if (typeof window === 'undefined') return path;
    
    const isCustom = isCustomDomain();
    const currentHostname = window.location.hostname;
    
    if (isCustom) {
      // En dominio personalizado: URL directa sin subdominio ni locale
      return path.startsWith('/') ? path : `/${path}`;
    } else {
      // En dominio de plataforma: verificar si ya estamos en el subdominio correcto
      const expectedSubdomain = `${storeSubdomain}.shopifree.app`;
      
      if (currentHostname === expectedSubdomain) {
        // Ya estamos en el subdominio correcto, no agregar el subdominio al path
        return path.startsWith('/') ? path : `/${path}`;
      } else {
        // Estamos en un contexto diferente, incluir el subdominio
        return `/${storeSubdomain}${path.startsWith('/') ? path : `/${path}`}`;
      }
    }
  };
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [locale, setLocale] = useState<string>('es');
  
  // Estados para carrusel de galería - swipe simplificado
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Estado para variantes seleccionadas
  const [selectedVariant, setSelectedVariant] = useState<{ [key: string]: string }>({});

  // Hook del carrito
  const { addItem, openCart, state, removeItem } = useCart();

  // Función para manejar cambios de variantes
  const handleVariantChange = (variant: { [key: string]: string }) => {
    setSelectedVariant(variant);
  };

  // Función para agregar producto al carrito
  const handleAddToCart = () => {
    if (!product) return;

    // Verificar si el producto tiene variantes disponibles y si todas están seleccionadas
    const variantFields = ['color', 'size', 'size_clothing', 'size_shoes', 'material', 'style', 'clothing_style'];
    const availableVariants = product.tags ? Object.entries(product.tags).filter(([key, value]) => {
      const displayName = {
        'color': 'Color',
        'size': 'Talla',
        'size_clothing': 'Talla',
        'size_shoes': 'Talla de Calzado',
        'material': 'Material',
        'style': 'Estilo',
        'clothing_style': 'Estilo'
      }[key];
      return displayName && Array.isArray(value) && value.length > 1;
    }) : [];

    // Verificar que todas las variantes estén seleccionadas
    const missingVariants = availableVariants.filter(([key]) => {
      const value = selectedVariant[key];
      return !value || value === '' || value === 'Seleccionar';
    });

    if (missingVariants.length > 0) {
      const missingNames = missingVariants.map(([key]) => {
        return {
          'color': 'Color',
          'size': 'Talla',
          'size_clothing': 'Talla',
          'size_shoes': 'Talla de Calzado',
          'material': 'Material',
          'style': 'Estilo',
          'clothing_style': 'Estilo'
        }[key];
      }).join(', ');
      alert(`Por favor selecciona: ${missingNames}`);
      return;
    }
    
    // Obtener la cantidad del input
    const quantityInput = document.getElementById('quantity') as HTMLInputElement;
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

    // Crear información de variante si hay variantes seleccionadas
    let variantInfo: { id: string; name: string; price: number } | undefined = undefined;
    let variantId = product.id;

    if (Object.keys(selectedVariant).length > 0) {
      // Crear ID único para la variante
      const variantParts = Object.entries(selectedVariant).map(([key, value]) => `${key}:${value}`);
      variantId = `${product.id}-${variantParts.join('-')}`;
      
      // Crear descripción de variantes para mostrar por separado
      const variantDescription = Object.entries(selectedVariant)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      // Información de variante para el carrito
      variantInfo = {
        id: variantParts.join('-'),
        name: variantDescription,
        price: product.price // Por ahora usar el mismo precio, se puede extender para precios específicos de variante
      };
    }
    
    // Verificar si existe un item incompleto del mismo producto para reemplazarlo
    const existingIncompleteItem = state.items.find(
      item => item.productId === product.id && item.incomplete
    );

    if (existingIncompleteItem) {
      // Eliminar el item incompleto antes de agregar el completo
      removeItem(existingIncompleteItem.id);
    }

    addItem({
      id: variantId,
      productId: product.id,
      name: product.name, // Usar el nombre original del producto
      price: product.price,
      currency: storeInfo?.currency || 'COP',
      image: product.image || '',
      slug: product.slug || product.id,
      variant: variantInfo,
      incomplete: false // Siempre completo desde la página de producto
    }, quantity);
    
    // Abrir el carrito automáticamente después de agregar el producto
    openCart();
    
    // Feedback visual opcional
    const variantText = variantInfo ? ` con variantes: ${variantInfo.name}` : '';
    console.log(`Agregado al carrito: ${product.name}${variantText} (${quantity} unidades)`);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const id = await getStoreIdBySubdomain(storeSubdomain);
        if (!alive) return;
        setStoreId(id);
        if (id) {
          console.log(`🔍 [ProductDetail] Buscando producto con slug: "${productSlug}" en store: ${id}`);
          const p = await getProduct(id, productSlug);
          console.log(`🔍 [ProductDetail] Resultado de getProduct:`, p);
          if (!alive) return;
          setProduct(p);
          // cargar info base para header/footer y configuración de locale
          const [info, cats, prods, primaryLocale] = await Promise.all([
            getStoreBasicInfo(id),
            getStoreCategories(id),
            getStoreProducts(id),
            getStorePrimaryLocale(id)
          ]);
          if (!alive) return;
          setStoreInfo(info);
          setCategories(cats);
          setProducts(prods);
          setLocale(primaryLocale || 'es');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [storeSubdomain, productSlug]);

  // Precompute JSON-LD for all renders to keep hooks order consistent
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const l = locale || 'es';
  const sub = storeSubdomain;

  // Helper para generar URLs absolutas correctas para JSON-LD
  const buildAbsoluteUrl = (path: string) => {
    if (typeof window === 'undefined') return '';
    const relativePath = buildUrl(path);
    return `${origin}${relativePath}`;
  };

  const breadcrumbJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: buildAbsoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: buildAbsoluteUrl('/catalogo') },
      { '@type': 'ListItem', position: 3, name: product.name, item: buildAbsoluteUrl(`/producto/${encodeURIComponent(product.slug || product.id)}`) }
    ]
  } : null;

  const productJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: product.image ? [product.image] : undefined,
    sku: product.id,
    offers: (product.price != null) ? {
      '@type': 'Offer',
      price: String(product.price),
      priceCurrency: product.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url: buildAbsoluteUrl(`/producto/${encodeURIComponent(product.slug || product.id)}`)
    } : undefined
  } : null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Product skeleton */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image skeleton */}
            <div className="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
            
            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-100 rounded w-2/3 animate-pulse"></div>
              <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded w-1/3 animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Loading indicator */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="container"><h1>Producto no encontrado</h1></div>;
  }

  // Crear array de todos los medios disponibles
  const allMedia = [];
  
  // Agregar imagen principal si existe
  if (product.image) {
    allMedia.push({
      type: 'image',
      url: product.image,
      isMain: true
    });
  }
  
  // Agregar video principal si existe (más prioritario que imagen)
  if (product.video) {
    allMedia.unshift({
      type: 'video',
      url: product.video,
      isMain: true
    });
  }
  
  // Agregar archivos de media adicionales
  if (product.mediaFiles && product.mediaFiles.length > 0) {
    product.mediaFiles.forEach(media => {
      // Solo agregar si no es la imagen/video principal
      if (media.url !== product.image && media.url !== product.video) {
        allMedia.push({
          type: media.type || 'image',
          url: media.url,
          isMain: false
        });
      }
    });
  }

  // Obtener el medio activo
  const activeMedia = allMedia[activeMediaIndex] || allMedia[0];
  
  // Función para cambiar imagen - simplificada
  const changeMedia = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < allMedia.length && newIndex !== activeMediaIndex) {
      setActiveMediaIndex(newIndex);
    }
  };

  // Funciones para navegación móvil
  const goToPrevious = () => {
    if (activeMediaIndex > 0) {
      changeMedia(activeMediaIndex - 1);
    }
  };

  const goToNext = () => {
    if (activeMediaIndex < allMedia.length - 1) {
      changeMedia(activeMediaIndex + 1);
    }
  };

  // Constante para el threshold mínimo de swipe
  const minSwipeDistance = 50;

  // Handle del inicio del touch (solo móvil)
  const onTouchStart = (e: React.TouchEvent) => {
    // Solo en móvil
    if (typeof window !== 'undefined' && window.innerWidth > 768) return;
    
    setTouchEnd(null); // Reset del end al iniciar
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Handle del movimiento del touch (solo móvil)
  const onTouchMove = (e: React.TouchEvent) => {
    // Solo en móvil
    if (typeof window !== 'undefined' && window.innerWidth > 768) return;
    
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Handle del final del touch y detección de swipe (solo móvil)
  const onTouchEnd = () => {
    // Solo en móvil
    if (typeof window !== 'undefined' && window.innerWidth > 768) return;
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeMediaIndex < allMedia.length - 1) {
      // Swipe izquierda -> siguiente imagen
      changeMedia(activeMediaIndex + 1);
    } else if (isRightSwipe && activeMediaIndex > 0) {
      // Swipe derecha -> imagen anterior
      changeMedia(activeMediaIndex - 1);
    }
    
    // Reset de estados
    setTouchStart(null);
    setTouchEnd(null);
  };

  const getCurrentMediaElement = () => {
    if (!activeMedia) return <div className="nbd-no-media">Sin imagen disponible</div>;
    
    if (activeMedia.type === 'video') {
      return (
        <video 
          src={optimizeCloudinaryVideo(activeMedia.url)} 
          muted 
          autoPlay 
          playsInline 
          loop 
          preload="metadata"
          controls
          onError={(e) => {
            console.warn('Main video error:', activeMedia.url, e);
            // Intentar recargar una vez
            const video = e.target as HTMLVideoElement;
            if (!video.dataset.retried) {
              video.dataset.retried = 'true';
              setTimeout(() => {
                video.load();
              }, 1000);
            }
          }}
          onLoadStart={() => {
            // Video iniciando carga
          }}
          onCanPlay={() => {
            // Video listo para reproducir
          }}
        />
      );
    } else {
      return (
        <img 
          src={toCloudinarySquare(activeMedia.url, 900)} 
          alt={product.name}
          onError={(e) => {
            console.log('Main image error:', e);
          }}
        />
      );
    }
  };

  return (
    <Layout storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} products={products} storeId={storeId}>
      {/* JSON-LD SEO */}
      {breadcrumbJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      ) : null}
      {productJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      ) : null}
      
      {/* Breadcrumb minimalista */}
      <nav className="nbd-breadcrumbs" aria-label="Breadcrumb">
        <a href={buildUrl('/')} className="nbd-breadcrumb-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Inicio
        </a>
        <span className="nbd-breadcrumbs-sep">/</span>
        
        {/* Mostrar categoría si está disponible */}
        {(() => {
          // Buscar la categoría del producto
          const productCategory = categories?.find(cat => 
            product.selectedParentCategoryIds?.includes(cat.id) || 
            product.categoryId === cat.id
          );
          
          if (productCategory) {
            return (
              <>
                <a href={buildUrl(`/categoria/${productCategory.slug}`)} className="nbd-breadcrumb-link">
                  {productCategory.name}
                </a>
                <span className="nbd-breadcrumbs-sep">/</span>
              </>
            );
          } else {
            return (
              <>
                <a href={buildUrl('/catalogo')} className="nbd-breadcrumb-link">
                  Catálogo
                </a>
                <span className="nbd-breadcrumbs-sep">/</span>
              </>
            );
          }
        })()}
        
        <span className="nbd-breadcrumb-current" aria-current="page">
          {product.name}
        </span>
      </nav>

      <section className="nbd-product-detail">
        <div className="nbd-container">
      <div className="nbd-product">
            {/* Galería de medios - Carrusel moderno */}
            <div className="nbd-product-gallery">
              <div className="nbd-carousel-container">
                <div 
                  className="nbd-carousel-track"
                  style={{
                    transform: `translateX(-${activeMediaIndex * 100}%)`,
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {allMedia.map((media, index) => (
                    <div key={index} className="nbd-carousel-slide">
                      {media.type === 'video' ? (
                        <video 
                          src={optimizeCloudinaryVideo(media.url)} 
                          muted 
                          autoPlay={index === activeMediaIndex}
                          loop 
                          playsInline
                          preload={index === activeMediaIndex ? "metadata" : "none"}
                          controls={index === activeMediaIndex}
                          crossOrigin="anonymous"
                          disablePictureInPicture
                          onError={(e) => {
                            console.warn('Error loading video:', media.url, e);
                            // Intentar recargar una vez
                            const video = e.target as HTMLVideoElement;
                            if (!video.dataset.retried) {
                              video.dataset.retried = 'true';
                              setTimeout(() => {
                                video.load();
                              }, 1000);
                            }
                          }}
                          onLoadStart={() => {
                            // Opcional: logging de inicio de carga
                          }}
                          onCanPlay={() => {
                            // Video listo para reproducir
                          }}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            // Mejorar nitidez del video
                            imageRendering: 'crisp-edges',
                            filter: 'contrast(1.1) brightness(1.05)',
                          }}
                        />
                      ) : (
                        <img 
                          src={toCloudinarySquare(media.url, 900)} 
                          alt={`${product.name} ${index + 1}`}
                          loading="lazy"
                          onError={(e) => {
                            console.warn('Error loading image:', media.url, e);
                            // Fallback a imagen original si Cloudinary falla
                            const img = e.target as HTMLImageElement;
                            if (!img.dataset.retried && img.src !== media.url) {
                              img.dataset.retried = 'true';
                              img.src = media.url;
                            }
                          }}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                

              </div>
              
              {/* Indicadores de galería si hay múltiples medios */}
              {allMedia.length > 1 && (
                <div className="nbd-gallery-indicators">
                  {allMedia.slice(0, 6).map((media, index) => (
                    <div 
                      key={index} 
                      className={`nbd-gallery-indicator ${index === activeMediaIndex ? 'active' : ''}`}
                      onClick={() => changeMedia(index)}
                    >
                      {media.type === 'video' ? (
                        <div className="nbd-video-thumbnail">
                          <video 
                            src={optimizeCloudinaryVideo(media.url)} 
                            muted 
                            loop 
                            playsInline
                            preload="metadata"
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              pointerEvents: 'none',
                              // Mejorar nitidez del video
                              imageRendering: 'crisp-edges',
                              filter: 'contrast(1.1) brightness(1.05)',
                            }}
                            onLoadedMetadata={(e) => {
                              // Una vez que los metadatos estén cargados, intentar reproducir
                              const video = e.currentTarget;
                              video.currentTime = 0;
                              
                              // Marcar como cargado para la transición CSS
                              video.setAttribute('data-loaded', 'true');
                              
                              // Pequeño delay para asegurar que el DOM esté listo
                              setTimeout(() => {
                                video.play().catch(() => {
                                  // Si falla el autoplay, el video se mantiene en el primer frame
                                  console.log('Autoplay blocked for video thumbnail, showing first frame');
                                });
                              }, 100);
                            }}
                            onCanPlay={(e) => {
                              // Cuando el video pueda reproducirse, intentar play de nuevo
                              const video = e.currentTarget;
                              video.setAttribute('data-loaded', 'true');
                              
                              if (video.paused) {
                                video.play().catch(() => {
                                  // Fallback silencioso - el primer frame se mostrará
                                });
                              }
                            }}
                            onError={(e) => {
                              console.warn('Video thumbnail load error:', media.url, e);
                              // En caso de error, mostrar fallback
                              const video = e.currentTarget;
                              const parent = video.parentElement;
                              
                              // Solo intentar fallback una vez
                              if (!video.dataset.fallbackApplied && parent) {
                                video.dataset.fallbackApplied = 'true';
                                parent.innerHTML = `
                                  <div class="nbd-video-fallback" style="
                                    display: flex; 
                                    align-items: center; 
                                    justify-content: center; 
                                    background: rgba(0,0,0,0.1); 
                                    width: 100%; 
                                    height: 100%;
                                    border-radius: var(--nbd-radius-md);
                                    position: relative;
                                  ">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="opacity: 0.6;">
                                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                                    </svg>
                                    <div style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; text-transform: uppercase;">VIDEO</div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <img 
                          src={toCloudinarySquare(media.url, 100)} 
                          alt={`${product.name} ${index + 1}`}
                          onError={(e) => {
                            console.log('Image thumbnail error:', e);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
        </div>

            {/* Información del producto */}
            <div className="nbd-product-info">
              <div className="nbd-product-header">
          <h1 className="nbd-product-title">{product.name}</h1>
                {product.brand && (
                  <span className="nbd-product-brand">por {product.brand}</span>
                )}
              </div>

          {typeof product.price === 'number' ? (
                <div className="nbd-product-pricing">
                  {product.comparePrice && product.comparePrice > product.price ? (
                    <div className="nbd-price-comparison">
                      <span className="nbd-price-original">
                        {formatPrice(product.comparePrice, storeInfo?.currency)}
                      </span>
                      <span className="nbd-price-discount">
                        -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                      </span>
                    </div>
                  ) : null}
            <p className="nbd-product-price">
               {formatPrice(product.price, storeInfo?.currency)}
            </p>
                </div>
          ) : null}

              {/* Disponibilidad */}
              <div className="nbd-product-availability">
                <div className="nbd-availability-indicator">
                  <div className="nbd-availability-dot"></div>
                  <span>En stock</span>
                </div>
              </div>

              {/* Descripción */}
          {product.description ? (
                <div className="nbd-product-description">
                  <h3>Descripción</h3>
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
          ) : null}

              {/* Selector de variantes */}
              <ProductVariantSelector 
                product={product}
                onVariantChange={handleVariantChange}
              />

              {/* Selector de cantidad */}
              <div className="nbd-quantity-selector">
                <label htmlFor="quantity" className="nbd-quantity-label">Cantidad:</label>
                <div className="nbd-quantity-controls">
                  <button 
                    type="button" 
                    id="quantity-minus"
                    className="nbd-quantity-btn nbd-quantity-btn--minus"
                    onClick={() => {
                      const input = document.getElementById('quantity') as HTMLInputElement;
                      const minusBtn = document.getElementById('quantity-minus') as HTMLButtonElement;
                      if (input && parseInt(input.value) > 1) {
                        const newValue = parseInt(input.value) - 1;
                        input.value = newValue.toString();
                        if (newValue === 1) {
                          minusBtn.disabled = true;
                        }
                      }
                    }}
                    disabled
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12H19"/>
                    </svg>
                  </button>
                  <input 
                    id="quantity"
                    type="number" 
                    min="1" 
                    max="99"
                    defaultValue="1" 
                    className="nbd-quantity-input"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      const minusBtn = document.getElementById('quantity-minus') as HTMLButtonElement;
                      if (value <= 1) {
                        e.target.value = "1";
                        minusBtn.disabled = true;
                      } else {
                        minusBtn.disabled = false;
                      }
                      if (value > 99) {
                        e.target.value = "99";
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="nbd-quantity-btn nbd-quantity-btn--plus"
                    onClick={() => {
                      const input = document.getElementById('quantity') as HTMLInputElement;
                      const minusBtn = document.getElementById('quantity-minus') as HTMLButtonElement;
                      if (input && parseInt(input.value) < 99) {
                        const newValue = parseInt(input.value) + 1;
                        input.value = newValue.toString();
                        if (newValue > 1) {
                          minusBtn.disabled = false;
                        }
                      }
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5V19M5 12H19"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Acciones */}
              <div className="nbd-product-actions">
                {/* Botón principal - Agregar al carrito */}
                <button 
                  className="nbd-btn nbd-btn--primary nbd-btn--cart"
                  onClick={handleAddToCart}
                  disabled={!product || typeof product.price !== 'number'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17A2 2 0 0 1 15 19H9A2 2 0 0 1 7 17V13M17 13H7"/>
                  </svg>
                  Agregar al carrito
                </button>
                
                {/* Botones secundarios */}
                <div className="nbd-secondary-actions">
                  <button className="nbd-btn nbd-btn--outline nbd-btn--secondary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61A5.5 5.5 0 0 0 16 2A5.5 5.5 0 0 0 12 4A5.5 5.5 0 0 0 8 2A5.5 5.5 0 0 0 3.16 4.61C1.42 6.81 1.42 10.19 3.16 12.39L12 22L20.84 12.39C22.58 10.19 22.58 6.81 20.84 4.61Z"/>
                    </svg>
                    Favoritos
                  </button>
                  <button 
                    className="nbd-btn nbd-btn--outline nbd-btn--secondary"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: product.name,
                          text: `Mira este producto: ${product.name}`,
                          url: window.location.href
                        });
                      } else {
                        // Fallback para navegadores que no soportan Web Share API
                        navigator.clipboard.writeText(window.location.href);
                        alert('Enlace copiado al portapapeles');
                      }
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V12"/>
                      <path d="M16 6L12 2L8 6"/>
                      <path d="M12 2V15"/>
                    </svg>
                    Compartir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}


