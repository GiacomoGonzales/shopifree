'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { PublicProduct } from '../../lib/products';
import { StoreBasicInfo } from '../../lib/store';
import { formatPrice } from '../../lib/currency';

interface SearchComponentProps {
    products: PublicProduct[];
    isOpen: boolean;
    onClose: () => void;
    isCustomDomain?: boolean;
    storeSubdomain?: string;
    storeInfo?: StoreBasicInfo | null;
}

export default function SearchComponent({ 
    products, 
    isOpen, 
    onClose, 
    isCustomDomain = false, 
    storeSubdomain = '',
    storeInfo = null
}: SearchComponentProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

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
            return `/producto/${productSlug}`;
        }
        return `/${storeSubdomain}/producto/${productSlug}`;
    };



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
                        placeholder="Buscar productos..."
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
                    {isMobile ? 'Cancelar' : (
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
                        <h3>Buscar productos</h3>
                        <p>Encuentra lo que necesitas escribiendo el nombre del producto, marca o categoría.</p>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="nbd-search-empty">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="nbd-search-empty-icon">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <h3>Sin resultados</h3>
                        <p>No encontramos productos que coincidan con "{searchQuery}".</p>
                        <p className="nbd-search-suggestion">Intenta con términos más generales o revisa la ortografía.</p>
                    </div>
                ) : (
                    <>
                        <div className="nbd-search-results-header">
                            <h3>Resultados ({searchResults.length})</h3>
                        </div>
                        <div className="nbd-search-results">
                            {searchResults.map((product) => (
                                <a
                                    key={product.id}
                                    href={getProductUrl(product.slug || product.id)}
                                    className="nbd-search-result-item"
                                    onClick={onClose}
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
                                            {product.comparePrice && product.comparePrice > product.price && (
                                                <span className="nbd-search-result-compare-price">
                                                    {formatPrice(product.comparePrice, storeInfo?.currency)}
                                                </span>
                                            )}
                                            <span className="nbd-search-result-current-price">
                                                {formatPrice(product.price, storeInfo?.currency)}
                                            </span>
                                        </div>
                                    </div>
                                </a>
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
