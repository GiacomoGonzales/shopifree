"use client";

import { PublicCollection, getCollectionCardSize } from "../lib/collections";
import { toCloudinaryMosaic } from "../lib/images";
import { useStoreLanguage } from "../lib/store-language-context";

interface CollectionCardProps {
    collection: PublicCollection;
    size: 'normal' | 'wide' | 'tall' | 'large';
    storeSubdomain: string;
    additionalText: (key: string) => string;
}

const CollectionCard = ({ collection, size, storeSubdomain, additionalText }: CollectionCardProps) => {
    // Optimizar imagen según el tamaño de la card
    const optimizedImageUrl = toCloudinaryMosaic(collection.image, size, 400);
    
    // Contar productos en la colección
    const productCount = collection.productIds?.length || 0;
    
    return (
        <a
            href={`/${storeSubdomain}/coleccion/${collection.slug}`}
            className={`nbd-collection-card nbd-collection-card--${size}`}
        >
            {/* Imagen de fondo */}
            <div className="nbd-collection-background">
                {optimizedImageUrl ? (
                    <img
                        src={optimizedImageUrl}
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
                    <p className="nbd-collection-count">
                        {productCount} {productCount === 1 ? additionalText('product') : additionalText('products')}
                    </p>
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
}

const CollectionsMosaic = ({ collections, storeSubdomain }: CollectionsMosaicProps) => {
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
                    <h2 className="nbd-section-title">Colecciones</h2>
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
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CollectionsMosaic;
