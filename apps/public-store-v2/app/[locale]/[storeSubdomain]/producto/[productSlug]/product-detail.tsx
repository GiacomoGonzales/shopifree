"use client";

import { useEffect, useState } from 'react';
import { getStoreIdBySubdomain } from '../../../../../lib/store';
import { getProduct, getProductBySlug, PublicProduct } from '../../../../../lib/products';
import { toCloudinarySquare } from '../../../../../lib/images';
import { formatPrice } from '../../../../../lib/currency';
import Layout from '../../../../../themes/new-base-default/Layout';
import { getStoreBasicInfo, StoreBasicInfo } from '../../../../../lib/store';
import { getStoreCategories, Category } from '../../../../../lib/categories';

type Props = {
  storeSubdomain: string;
  productSlug: string;
  locale?: string;
};

export default function ProductDetail({ storeSubdomain, productSlug, locale }: Props) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  
  // Estados para carrusel de galería
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const id = await getStoreIdBySubdomain(storeSubdomain);
        if (!alive) return;
        setStoreId(id);
        if (id) {
          const p = await getProduct(id, productSlug);
          if (!alive) return;
          setProduct(p);
          // cargar info base para header/footer
          const [info, cats] = await Promise.all([
            getStoreBasicInfo(id),
            getStoreCategories(id)
          ]);
          if (!alive) return;
          setStoreInfo(info);
          setCategories(cats);
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

  const breadcrumbJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${origin}/${l}/${sub}` },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${origin}/${l}/${sub}/catalogo` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${origin}/${l}/${sub}/producto/${encodeURIComponent(product.slug || product.id)}` }
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
      url: `${origin}/${l}/${sub}/producto/${encodeURIComponent(product.slug || product.id)}`
    } : undefined
  } : null;

  if (loading) {
    return <div className="container">Cargando…</div>;
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
  
  // Función para cambiar imagen con transición suave
  const changeMedia = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < allMedia.length && newIndex !== activeMediaIndex) {
      setIsTransitioning(true);
      setActiveMediaIndex(newIndex);
      setTimeout(() => setIsTransitioning(false), 300);
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

  // Touch events simplificados y sin errores
  const handleSwipeGesture = (e: React.TouchEvent) => {
    if (typeof window === 'undefined' || window.innerWidth > 768) return;
    
    const container = e.currentTarget as HTMLElement;
    let startX = 0;
    let isDragging = false;

    const onTouchStart = (te: TouchEvent) => {
      startX = te.touches[0].clientX;
      isDragging = true;
      container.style.transition = 'none';
    };

    const onTouchMove = (te: TouchEvent) => {
      if (!isDragging) return;
      
      const currentX = te.touches[0].clientX;
      const deltaX = currentX - startX;
      const translateX = (-activeMediaIndex * 100) + (deltaX / container.offsetWidth * 100);
      
      container.style.transform = `translateX(${translateX}%)`;
    };

    const onTouchEnd = (te: TouchEvent) => {
      if (!isDragging) return;
      
      const endX = te.changedTouches[0].clientX;
      const deltaX = endX - startX;
      const threshold = container.offsetWidth / 4;
      
      container.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      if (deltaX > threshold && activeMediaIndex > 0) {
        changeMedia(activeMediaIndex - 1);
      } else if (deltaX < -threshold && activeMediaIndex < allMedia.length - 1) {
        changeMedia(activeMediaIndex + 1);
      } else {
        container.style.transform = `translateX(-${activeMediaIndex * 100}%)`;
      }
      
      isDragging = false;
      
      // Limpiar event listeners
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
  };

  const getCurrentMediaElement = () => {
    if (!activeMedia) return <div className="nbd-no-media">Sin imagen disponible</div>;
    
    if (activeMedia.type === 'video') {
      return (
        <video 
          src={activeMedia.url} 
          muted 
          autoPlay 
          playsInline 
          loop 
          preload="metadata"
          controls
          onError={(e) => {
            console.log('Main video error:', e);
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
    <Layout storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain}>
      {/* JSON-LD SEO */}
      {breadcrumbJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      ) : null}
      {productJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      ) : null}
      
      {/* Breadcrumb minimalista */}
      <nav className="nbd-breadcrumbs" aria-label="Breadcrumb">
        <a href={`/${l}/${storeSubdomain}`} className="nbd-breadcrumb-link">
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
                <a href={`/${l}/${storeSubdomain}/categoria/${productCategory.slug}`} className="nbd-breadcrumb-link">
                  {productCategory.name}
                </a>
                <span className="nbd-breadcrumbs-sep">/</span>
              </>
            );
          } else {
            return (
              <>
                <a href={`/${l}/${storeSubdomain}/catalogo`} className="nbd-breadcrumb-link">
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
                    transition: isTransitioning ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                  }}
                  onTouchStart={handleSwipeGesture}
                >
                  {allMedia.map((media, index) => (
                    <div key={index} className="nbd-carousel-slide">
                      {media.type === 'video' ? (
                        <video 
                          src={media.url} 
                          muted 
                          autoPlay={index === activeMediaIndex}
                          loop 
                          playsInline
                          preload="metadata"
                          controls={index === activeMediaIndex}
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
                            src={media.url} 
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
                              console.error('Video thumbnail load error:', e);
                              // En caso de error, mostrar fallback
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="nbd-video-fallback">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                      <path d="M8 5V19L19 12L8 5Z" fill="white"/>
                                    </svg>
                                    <span>Video</span>
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
                  {product.originalPrice && product.originalPrice > product.price ? (
                    <div className="nbd-price-comparison">
                      <span className="nbd-price-original">
                        {formatPrice(product.originalPrice, storeInfo?.currency)}
                      </span>
                      <span className="nbd-price-discount">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
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

              {/* Características del producto */}
              <div className="nbd-product-features">
                <h3>Características</h3>
                <div className="nbd-features-grid">
                  <div className="nbd-feature">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M7 18C7 15.2386 9.23858 13 12 13C14.7614 13 17 15.2386 17 18V21H7V18Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 13C14.2091 13 16 11.2091 16 9C16 6.79086 14.2091 5 12 5C9.79086 5 8 6.79086 8 9C8 11.2091 9.79086 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <div>
                      <strong>Calidad Premium</strong>
                      <span>Materiales de alta calidad</span>
                    </div>
                  </div>
                  <div className="nbd-feature">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 7L12 3L4 7L12 11L20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 7V17L12 21L20 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <strong>Envío Gratis</strong>
                      <span>En compras mayores a $50</span>
                    </div>
                  </div>
                  <div className="nbd-feature">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <strong>Garantía</strong>
                      <span>30 días de garantía</span>
                    </div>
                  </div>
                </div>
              </div>

                              {/* Acciones */}
          <div className="nbd-product-actions">
                  {/* Botón principal - 100% ancho */}
                  <button className="nbd-btn nbd-btn--primary nbd-btn--full-width">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17A2 2 0 0 1 15 19H9A2 2 0 0 1 7 17V13M17 13H7"/>
                    </svg>
                    Agregar al carrito
                  </button>
                  
                  {/* Botones secundarios - 50% cada uno */}
                  <div className="nbd-secondary-actions">
                    <button className="nbd-btn nbd-btn--outline nbd-btn--half-width">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61A5.5 5.5 0 0 0 16 2A5.5 5.5 0 0 0 12 4A5.5 5.5 0 0 0 8 2A5.5 5.5 0 0 0 3.16 4.61C1.42 6.81 1.42 10.19 3.16 12.39L12 22L20.84 12.39C22.58 10.19 22.58 6.81 20.84 4.61Z"/>
                      </svg>
                      Favoritos
                    </button>
                    <button 
                      className="nbd-btn nbd-btn--ghost nbd-btn--half-width" 
                      onClick={() => history.back()}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19L5 12L12 5"/>
                      </svg>
                      Volver
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


