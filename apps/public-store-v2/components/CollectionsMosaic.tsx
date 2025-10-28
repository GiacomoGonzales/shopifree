"use client";

import { PublicCollection, getCollectionCardSize } from "../lib/collections";
import { toCloudinaryMosaic } from "../lib/images";
import { useStoreLanguage } from "../lib/store-language-context";

interface CollectionCardProps {
    collection: PublicCollection;
    size: 'normal' | 'wide' | 'tall' | 'large';
    storeSubdomain: string;
    additionalText: (key: string) => string;
    onCollectionHover?: (collectionSlug: string) => void;
}

const CollectionCard = ({ collection, size, storeSubdomain, additionalText, onCollectionHover }: CollectionCardProps) => {
    // Optimizar imagen según el tamaño de la card con diferentes resoluciones para responsive
    const getOptimizedImageUrl = () => {
        // Para desktop usamos tamaños más grandes, para móvil más pequeños
        const mobileBaseSize = 400;
        const desktopBaseSize = 800;

        return {
            mobile: toCloudinaryMosaic(collection.image, size, mobileBaseSize),
            desktop: toCloudinaryMosaic(collection.image, size, desktopBaseSize)
        };
    };

    const imageUrls = getOptimizedImageUrl();
    const optimizedImageUrl = imageUrls.desktop; // Por ahora usamos la versión desktop
    
    // Contar productos en la colección
    const productCount = collection.productIds?.length || 0;
    
    // Función para detectar si estamos en un dominio personalizado
    const isCustomDomain = () => {
        if (typeof window === 'undefined') return false;
        const host = window.location.hostname;
        return !host.endsWith('shopifree.app') && !host.endsWith('localhost') && host !== 'localhost';
    };
    
    // Función para construir URLs correctamente
    const getSubdomainUrl = (path: string) => {
        const isCustom = isCustomDomain();
        if (isCustom) {
            // En dominio personalizado: URL directa sin subdominio
            return path.startsWith('/') ? path : `/${path}`;
        } else {
            // En localhost desarrollo: URL directa (middleware maneja internamente)
            return path.startsWith('/') ? path : `/${path}`;
        }
    };
    
    return (
        <a
            href={getSubdomainUrl(`/coleccion/${collection.slug}`)}
            className={`nbd-collection-card nbd-collection-card--${size}`}
            onMouseEnter={() => onCollectionHover?.(collection.slug)}
        >
            {/* Imagen de fondo */}
            <div className="nbd-collection-background">
                {imageUrls.desktop ? (
                    <img
                        src={imageUrls.desktop}
                        srcSet={`${imageUrls.mobile} 480w, ${imageUrls.desktop} 1024w`}
                        sizes="(max-width: 768px) 480px, 1024px"
                        alt={collection.title}
                        className="nbd-collection-image"
                        loading="lazy"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement as HTMLElement;
                            target.style.display = 'none';
                            if (parent) {
                                parent.classList.add('nbd-collection-fallback-active');
                            }
                        }}
                    />
                ) : null}
                
                {/* Fallback pattern */}
                <div className={`nbd-collection-fallback ${!optimizedImageUrl ? 'nbd-collection-fallback-active' : ''}`}>
                    <div className="nbd-collection-pattern">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 7L12 12L2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            {/* Overlay para legibilidad */}
            <div className="nbd-collection-overlay"></div>
            
            {/* Contenido */}
            <div className="nbd-collection-content">
                <div className="nbd-collection-text">
                    <h3 className="nbd-collection-title">{collection.title}</h3>
                    {collection.description && (
                        <p className="nbd-collection-description">
                            {collection.description}
                        </p>
                    )}

                </div>
                
                <div className="nbd-collection-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
        </a>
    );
};

interface CollectionsMosaicProps {
    collections: PublicCollection[];
    storeSubdomain: string;
    onCollectionHover?: (collectionSlug: string) => void;
}

const CollectionsMosaic = ({ collections, storeSubdomain, onCollectionHover }: CollectionsMosaicProps) => {
    const { language } = useStoreLanguage();
    
    // Helper para textos adicionales
    const additionalText = (key: string) => {
        const texts: Record<string, Record<string, string>> = {
            es: {
                'ourCollections': 'Nuestras Colecciones',
                'collectionsSubtitle': 'Descubre nuestras colecciones cuidadosamente seleccionadas',
                'products': 'productos',
                'product': 'producto'
            },
            en: {
                'ourCollections': 'Our Collections',
                'collectionsSubtitle': 'Discover our carefully curated collections',
                'products': 'products',
                'product': 'product'
            },
            pt: {
                'ourCollections': 'Nossas Coleções',
                'collectionsSubtitle': 'Descubra nossas coleções cuidadosamente selecionadas',
                'products': 'produtos',
                'product': 'produto'
            }
        };
        return texts[language]?.[key] || texts['es']?.[key] || key;
    };
    
    // Filtrar solo colecciones visibles
    const visibleCollections = collections.filter(collection => collection.visible);
    
    if (visibleCollections.length === 0) {
        return null; // No mostrar la sección si no hay colecciones
    }

    return (
        <section className="nbd-collections-mosaic">
            <div className="nbd-container">
                <div className="nbd-section-header">
                    <h2 className="nbd-section-title">{additionalText('ourCollections')}</h2>
                </div>
                
                <div className="nbd-collections-grid">
                    {visibleCollections.map((collection, index) => {
                        const cardSize = getCollectionCardSize(index, visibleCollections.length);
                        return (
                            <CollectionCard
                                key={collection.id}
                                collection={collection}
                                size={cardSize}
                                storeSubdomain={storeSubdomain}
                                additionalText={additionalText}
                                onCollectionHover={onCollectionHover}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CollectionsMosaic;
