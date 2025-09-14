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
import SimpleVariantSelector from '../../../components/SimpleVariantSelector';
import UnifiedLoading from '../../../components/UnifiedLoading';
import { usePromotions } from '../../../lib/hooks/usePromotions';

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
  console.log('🚀 [ProductDetail] INICIO DEL COMPONENTE');
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

  // Estado para la variante seleccionada
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Hook del carrito
  const { addItem, openCart, state, removeItem } = useCart();
  console.log('🎯 [ProductDetail] Después de useCart, antes de usePromotions');

  // Hook de promociones - COMENTADO TEMPORALMENTE PARA DEBUGGING
  console.log('🔍 [ProductDetail] ANTES del hook usePromotions');
  const originalPrice = selectedVariant ? selectedVariant.price : product?.price || 0;
  console.log('📊 [ProductDetail] Parámetros para hook:', { storeId, productId: product?.id, originalPrice });

  // COMENTADO TEMPORALMENTE
  /*
  let promotionsDataFromHook;
  try {
    promotionsDataFromHook = usePromotions(storeId, product?.id, originalPrice);
    console.log('✅ [ProductDetail] Hook usePromotions ejecutado correctamente');
  } catch (error) {
    console.error('❌ [ProductDetail] Error en hook usePromotions:', error);
    promotionsDataFromHook = { originalPrice: 0, finalPrice: 0, discount: 0, hasDiscountBadge: false };
  }
  */

  // Fallback temporal
  const promotionsDataFromHook = { originalPrice: 0, finalPrice: 0, discount: 0, hasDiscountBadge: false };
  console.log('✅ [ProductDetail] Hook usePromotions COMENTADO - usando fallback');

  // Estado para promociones (TEMPORAL - para comparar)
  const [promotionsData, setPromotionsData] = useState({
    originalPrice: 0,
    finalPrice: 0,
    discount: 0,
    hasDiscountBadge: false,
    appliedPromotion: undefined as any
  });

  // useEffect para cargar datos promocionales cuando storeId y product estén disponibles
  useEffect(() => {
    console.log('🔄 [ProductDetail] useEffect triggered:', {
      storeId: !!storeId,
      productId: product?.id,
      selectedVariantPrice: selectedVariant?.price
    });

    if (storeId && product?.id) {
      const originalPrice = selectedVariant ? selectedVariant.price : product.price;
      console.log('🚀 [ProductDetail] Loading promotions for:', {
        storeId,
        productId: product.id,
        originalPrice
      });

      // Cargar promociones de manera asíncrona
      const loadPromotions = async () => {
        try {
          const { getActivePromotionsForProduct, calculateDiscountedPrice, hasPromotionBadge } = await import('../../../lib/promotions');

          const activePromotions = await getActivePromotionsForProduct(storeId, product.id);
          console.log('📊 [ProductDetail] Active promotions found:', activePromotions);

          if (activePromotions.length > 0) {
            const discountResult = calculateDiscountedPrice(originalPrice, activePromotions);
            const showBadge = hasPromotionBadge(activePromotions);

            const promotionResult = {
              originalPrice,
              finalPrice: discountResult.finalPrice,
              discount: discountResult.discount,
              hasDiscountBadge: showBadge,
              appliedPromotion: discountResult.appliedPromotion
            };

            console.log('✅ [ProductDetail] Promotion result:', promotionResult);
            setPromotionsData(promotionResult);
          } else {
            // No hay promociones, usar precio original
            setPromotionsData({
              originalPrice,
              finalPrice: originalPrice,
              discount: 0,
              hasDiscountBadge: false,
              appliedPromotion: undefined
            });
          }
        } catch (error) {
          console.error('❌ [ProductDetail] Error loading promotions:', error);
          // Fallback to original price
          setPromotionsData({
            originalPrice,
            finalPrice: originalPrice,
            discount: 0,
            hasDiscountBadge: false,
            appliedPromotion: undefined
          });
        }
      };

      loadPromotions();
    }
  }, [storeId, product?.id, selectedVariant]);

  // Debug para página de producto
  console.log('🏪 [ProductDetail] Store info:', { storeId, productId: product?.id, productName: product?.name });
  console.log('💰 [ProductDetail] Price info MANUAL:', { promotionsData });
  console.log('🎯 [ProductDetail] Price info HOOK:', { promotionsDataFromHook });
  console.log('⚖️ [ProductDetail] COMPARISON:', {
    manual: promotionsData,
    hook: promotionsDataFromHook,
    areEqual: JSON.stringify(promotionsData) === JSON.stringify(promotionsDataFromHook)
  });
  console.log('⏱️ [ProductDetail] Timing check:', {
    hasStoreId: !!storeId,
    hasProduct: !!product,
    readyForPromotions: !!(storeId && product?.id)
  });

  // Función para manejar cambios de variantes
  const handleVariantChange = (variant: any) => {
    console.log('🔄 [ProductDetail] Variante cambiada:', variant);
    setSelectedVariant(variant);
  };


  // Función para generar mensaje de WhatsApp
  const generateWhatsAppMessage = () => {
    if (!product || !storeInfo) return '';
    
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    const price = promotionsData.finalPrice || (selectedVariant ? selectedVariant.price : product.price);
    const currency = storeInfo.currency || 'COP';
    const formattedPrice = formatPrice(price, currency);
    
    // Obtener información de variantes seleccionadas
    let variantText = '';
    if (selectedVariant && selectedVariant.attributes) {
      const variants = Object.entries(selectedVariant.attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      variantText = `\n📋 Variantes: ${variants}`;
    }
    
    // Obtener cantidad
    const quantityInput = document.getElementById('quantity') as HTMLInputElement;
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    const message = `¡Hola! 👋

Estoy interesado/a en este producto de ${storeInfo.storeName}:

🛍️ *${product.name}*
💰 Precio: ${formattedPrice}${variantText}
📦 Cantidad: ${quantity}

${productUrl}

¿Podrías darme más información sobre disponibilidad y proceso de compra?

¡Gracias!`;
    
    return encodeURIComponent(message);
  };

  // Función para abrir WhatsApp
  const handleWhatsAppClick = () => {
    if (!storeInfo?.phone) {
      alert('El número de WhatsApp no está configurado para esta tienda');
      return;
    }
    
    const message = generateWhatsAppMessage();
    const whatsappNumber = storeInfo.phone.replace(/[^\d]/g, ''); // Solo números
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // Función SIMPLIFICADA para agregar producto al carrito
  const handleAddToCart = () => {
    console.log('🛒 [SIMPLE] Iniciando handleAddToCart', { product: product?.name });
    
    if (!product) {
      console.log('❌ [SIMPLE] No hay producto');
      return;
    }

    // Obtener cantidad (predeterminado: 1)
    const quantityInput = document.getElementById('quantity') as HTMLInputElement;
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

    // Usar precios promocionales si están disponibles, sino usar precios base
    let finalPrice = promotionsData.finalPrice || (selectedVariant ? selectedVariant.price : product.price);
    let variantInfo: { id: string; name: string; price: number } | undefined = undefined;
    let itemId = product.id;

    if (selectedVariant) {
      console.log('✅ [SIMPLE] Usando variante seleccionada:', selectedVariant);
      itemId = `${product.id}-${selectedVariant.id}`;

      const variantDesc = Object.entries(selectedVariant.attributes || {})
        .map(([key, value]) => `${value}`)
        .join(', ');

      variantInfo = {
        id: selectedVariant.id,
        name: variantDesc || selectedVariant.name || 'Variante',
        price: finalPrice // Usar precio promocional si está disponible
      };
    } else {
      console.log('✅ [SIMPLE] Usando producto base sin variantes');
    }

    console.log('💰 [SIMPLE] Pricing details:', {
      hasPromotion: promotionsData.discount > 0,
      originalPrice: promotionsData.originalPrice,
      finalPrice,
      discount: promotionsData.discount
    });

    console.log('🛒 [SIMPLE] Agregando al carrito:', {
      itemId,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      quantity,
      variant: variantInfo
    });

    // Agregar al carrito (SIMPLE)
    try {
      addItem({
        id: itemId,
        productId: product.id,
        name: product.name,
        price: finalPrice,
        currency: storeInfo?.currency || 'COP',
        image: product.image || '',
        slug: product.slug || product.id,
        variant: variantInfo
      }, quantity);

      // Abrir carrito
      openCart();
      
      console.log('✅ [SIMPLE] Producto agregado exitosamente al carrito');
    } catch (error) {
      console.error('❌ [SIMPLE] Error al agregar al carrito:', error);
    }
  };

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
    return <UnifiedLoading storeInfo={storeInfo} />;
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
                  {/* Mostrar promoción activa si existe */}
                  {promotionsData.discount > 0 && promotionsData.appliedPromotion && (
                    <div className="nbd-price-comparison">
                      <span className="nbd-price-original">
                        {formatPrice(promotionsData.originalPrice, storeInfo?.currency)}
                      </span>
                      <span className="nbd-price-discount">
                        -{promotionsData.appliedPromotion.type === 'percentage' ?
                          `${promotionsData.appliedPromotion.discountValue}%` :
                          formatPrice(promotionsData.discount, storeInfo?.currency)}
                      </span>
                    </div>
                  )}
            <p className="nbd-product-price">
               {formatPrice(promotionsData.finalPrice || (selectedVariant ? selectedVariant.price : product.price), storeInfo?.currency)}
            </p>

            {/* Mostrar badge de promoción si está habilitado */}
            {promotionsData.hasDiscountBadge && promotionsData.appliedPromotion && (
              <div className="nbd-promotion-badge">
                🎉 {promotionsData.appliedPromotion.name}
              </div>
            )}

                  
                  {/* Información de stock */}
                  {product && (product as any).trackStock === true && (
                    <div className="nbd-stock-info">
                      {selectedVariant ? (
                        selectedVariant.stock > 0 ? (
                          <p className="nbd-stock-available">
                            ✅ {selectedVariant.stock} en stock
                          </p>
                        ) : (
                          <p className="nbd-stock-unavailable">
                            ❌ Sin stock
                          </p>
                        )
                      ) : (
                        (product as any).stockQuantity > 0 ? (
                          <p className="nbd-stock-available">
                            ✅ {(product as any).stockQuantity} en stock
                          </p>
                        ) : (
                          <p className="nbd-stock-unavailable">
                            ❌ Sin stock
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>
          ) : null}

              {/* Disponibilidad - SIEMPRE mostrar */}
              {(() => {
                const trackStock = (product as any).trackStock;
                
                let isAvailable = true;
                let statusText = 'En stock';
                
                // Si hay variante seleccionada y trackStock está habilitado
                if (selectedVariant && trackStock === true) {
                  isAvailable = selectedVariant.isAvailable && selectedVariant.stock > 0;
                  statusText = isAvailable ? 'En stock' : 'Sin stock temporalmente';
                } 
                // Si no hay variante pero trackStock está habilitado
                else if (trackStock === true) {
                  const stockQty = (product as any).stockQuantity || 0;
                  isAvailable = stockQty > 0;
                  statusText = isAvailable ? 'En stock' : 'Sin stock temporalmente';
                }
                
                return (
                  <div className="nbd-product-availability">
                    <div className="nbd-availability-indicator">
                      <div className={`nbd-availability-dot ${isAvailable ? 'available' : 'unavailable'}`}></div>
                      <span>{statusText}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Selector de variantes */}
              <SimpleVariantSelector 
                product={product}
                onVariantChange={handleVariantChange}
              />

              {/* Descripción */}
          {product.description ? (
                <div className="nbd-product-description">
                  <h3>Descripción</h3>
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
          ) : null}

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
                  disabled={!product}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17A2 2 0 0 1 15 19H9A2 2 0 0 1 7 17V13M17 13H7"/>
                  </svg>
                  Agregar al carrito
                </button>
                
                {/* Botones secundarios */}
                <div className="nbd-secondary-actions">
                  <button 
                    className="nbd-btn nbd-btn--outline nbd-btn--secondary nbd-btn--whatsapp"
                    onClick={handleWhatsAppClick}
                    style={{ 
                      backgroundColor: '#25D366',
                      borderColor: '#25D366',
                      color: 'white'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                    </svg>
                    <span className="nbd-whatsapp-text-full">Comprar por WhatsApp</span>
                    <span className="nbd-whatsapp-text-short">WhatsApp</span>
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


