'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { PublicProduct } from '../../lib/products';
import { StoreBasicInfo } from '../../lib/store';
import { formatPrice } from '../../lib/currency';
import { useStoreLanguage } from '../../lib/store-language-context';
import { usePromotions } from '../../lib/hooks/usePromotions';

interface SearchComponentProps {
    products: PublicProduct[];
    isOpen: boolean;
    onClose: () => void;
    isCustomDomain?: boolean;
    storeSubdomain?: string;
    storeInfo?: StoreBasicInfo | null;
    storeId?: string | null;
    onProductClick?: (product: PublicProduct) => void; // Callback opcional para temas que quieren custom behavior
}

export default function SearchComponent({
    products,
    isOpen,
    onClose,
    isCustomDomain = false,
    storeSubdomain = '',
    storeInfo = null,
    storeId = null,
    onProductClick
}: SearchComponentProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { t } = useStoreLanguage();

    // Detectar si es móvil
    useEffect(() => {
        const checkIsMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
        };
        
        // Solo establecer el estado inicial si es diferente
        if (typeof window !== 'undefined') {
            const initialMobile = window.innerWidth <= 768;
            setIsMobile(initialMobile);
        }
        
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-focus en el input cuando se abre (solo en desktop para evitar zoom en iOS)
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            // Solo hacer auto-focus en desktop - verificar directamente el tamaño de ventana
            const isMobileDevice = window.innerWidth <= 768;
            if (!isMobileDevice) {
                searchInputRef.current.focus();
            }
        }
    }, [isOpen]);

    // Limpiar búsqueda al cerrar
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
        }
    }, [isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Bloquear scroll del body en móvil
            if (isMobile) {
                document.body.style.overflow = 'hidden';
            }
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose, isMobile]);

    // Filtrar productos basado en la búsqueda
    const searchResults = useMemo(() => {
        if (!searchQuery.trim() || !products || !Array.isArray(products)) return [];
        
        const query = searchQuery.toLowerCase().trim();
        return products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.brand?.toLowerCase().includes(query)
        ).slice(0, 12); // Limitar a 12 resultados
    }, [searchQuery, products]);

    // Función para construir URL del producto
    const getProductUrl = (productSlug: string) => {
        if (isCustomDomain) {
            // Dominio personalizado: URL directa
            return `/producto/${productSlug}`;
        }

        // Verificar si estamos en localhost (desarrollo) o producción
        const isLocalhost = typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname.includes('localhost'));

        if (isLocalhost) {
            // En localhost: necesitamos /subdominio/producto/...
            return `/${storeSubdomain}/producto/${productSlug}`;
        } else {
            // En producción con subdominio: URL directa (el subdominio ya identifica la tienda)
            return `/producto/${productSlug}`;
        }
    };

    // Componente interno para cada producto con promociones
    function SearchResultItem({ product }: { product: PublicProduct }) {
        const promotionData = usePromotions(storeId || null, product.id || '', product.price);

        // Usar solo sistema de promociones, eliminar comparePrice obsoleto
        const hasPromotion = promotionData.discount > 0;
        const finalPrice = hasPromotion ? promotionData.finalPrice : product.price;
        const originalPrice = product.price;

        // Manejar click: si hay callback custom, usarlo; si no, navegar normalmente
        const handleClick = (e: React.MouseEvent) => {
            if (onProductClick) {
                e.preventDefault();
                onProductClick(product);
                onClose();
            } else {
                onClose();
            }
        };

        return (
            <a
                key={product.id}
                href={getProductUrl(product.slug || product.id)}
                className="nbd-search-result-item"
                onClick={handleClick}
            >
                <div className="nbd-search-result-image">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                        />
                    ) : (
                        <div className="nbd-search-result-placeholder">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5"/>
                                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                        </div>
                    )}
                </div>
                <div className="nbd-search-result-info">
                    <h4 className="nbd-search-result-name">{product.name}</h4>
                    {product.brand && (
                        <p className="nbd-search-result-brand">{product.brand}</p>
                    )}
                    <div className="nbd-search-result-price">
                        {hasPromotion && (
                            <span className="nbd-search-result-compare-price">
                                {formatPrice(originalPrice, storeInfo?.currency)}
                            </span>
                        )}
                        <span className="nbd-search-result-current-price">
                            {formatPrice(finalPrice, storeInfo?.currency)}
                        </span>
                    </div>
                </div>
            </a>
        );
    }


    if (!isOpen) return null;

    const searchContent = (
        <>
            {/* Header de búsqueda */}
            <div className="nbd-search-header">
                <div className="nbd-search-input-container">
                    <svg className="nbd-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="nbd-search-input"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="nbd-search-clear"
                            aria-label="Limpiar búsqueda"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="nbd-search-close"
                    aria-label="Cerrar búsqueda"
                >
                    {isMobile ? t('searchCancel') : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    )}
                </button>
            </div>

            {/* Contenido de resultados */}
            <div className="nbd-search-content">
                {!searchQuery.trim() ? (
                    <div className="nbd-search-empty">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="nbd-search-empty-icon">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <h3>{t('search')}</h3>
                        <p>{t('searchDescription')}</p>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="nbd-search-empty">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="nbd-search-empty-icon">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <h3>{t('searchNoResultsTitle')}</h3>
                        <p>{t('searchNoResultsText')} "{searchQuery}".</p>
                        <p className="nbd-search-suggestion">{t('searchNoResultsTip')}</p>
                    </div>
                ) : (
                    <>
                        <div className="nbd-search-results-header">
                            <h3>{t('searchResultsCount')} ({searchResults.length})</h3>
                        </div>
                        <div className="nbd-search-results">
                            {searchResults.map((product) => (
                                <SearchResultItem key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );

    // Renderizado condicional según dispositivo
    if (isMobile) {
        // Modal fullscreen en móvil
        return (
            <div className="nbd-search-modal-overlay">
                <div className="nbd-search-modal">
                    {searchContent}
                </div>
            </div>
        );
    } else {
        // Dropdown en desktop
        return (
            <>
                <div className="nbd-search-backdrop" onClick={onClose} />
                <div className="nbd-search-dropdown">
                    {searchContent}
                </div>
            </>
        );
    }
}
