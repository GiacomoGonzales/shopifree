"use client";

import { useEffect, useMemo, useState } from "react";
import { StoreBasicInfo } from "../../lib/store";
import { Category } from "../../lib/categories";
import { toCloudinarySquare } from "../../lib/images";
import { useCart } from "../../lib/cart-context";
import { PublicProduct } from "../../lib/products";
import { useStoreLanguage } from "../../lib/store-language-context";
import SearchComponent from "./SearchComponent";

type Props = {
    storeInfo: StoreBasicInfo | null;
    categories: Category[] | null;
    storeSubdomain: string;
    products: PublicProduct[];
    onProductClick?: (product: PublicProduct) => void; // Callback opcional para search
    onCategoryClick?: (categorySlug: string) => void; // Callback opcional para categorías
    onHomeHover?: () => void; // Callback para prefetch del home
};

export default function Header({ storeInfo, categories, storeSubdomain, products, onProductClick, onCategoryClick, onHomeHover }: Props) {
    const [isScrolled, setIsScrolled] = useState(false);
    const { state, openCart } = useCart();
    const { t } = useStoreLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // 🚀 NOTA: locale ya no se extrae de URL ya que no hay prefijo de idioma
    // El idioma se maneja a nivel SSR por configuración de tienda
    // const locale = useMemo(() => {
    //     try {
    //         const parts = window.location.pathname.split("/").filter(Boolean);
    //         return parts[0] || "es";
    //     } catch {
    //         return "es";
    //     }
    // }, []);

    const topCategories = useMemo(() => 
        (Array.isArray(categories) ? categories.filter(c => !c.parentCategoryId) : []), 
        [categories]
    );

    // Función para detectar si estamos en un dominio personalizado
    const isCustomDomain = () => {
        if (typeof window === 'undefined') return false;
        const host = window.location.hostname;
        return !host.endsWith('shopifree.app') && !host.endsWith('localhost') && host !== 'localhost';
    };
    
    // 🚀 CORREGIDO: URLs sin prefijo de idioma
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
        <>
            <header className={`nbd-header ${isScrolled ? 'nbd-header--scrolled' : ''}`}>
                <div className="nbd-header-container">
                    
                    {/* Logo y nombre de la tienda */}
                    <div className="nbd-header-brand">
                        <a href={getSubdomainUrl("")} className="nbd-brand-link" aria-label="Ir al inicio" onMouseEnter={() => onHomeHover?.()}>
                            {storeInfo?.logoUrl ? (
                                <div className="nbd-brand-logo">
                                    <img 
                                        src={toCloudinarySquare(storeInfo.logoUrl, 200)} 
                                        alt={storeInfo?.storeName || storeSubdomain} 
                                    />
                                </div>
                            ) : (
                                <div className="nbd-brand-placeholder">
                                    <span>{(storeInfo?.storeName || storeSubdomain).charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                            <span className="nbd-brand-name">
                                {storeInfo?.storeName || storeSubdomain}
                            </span>
                        </a>
                    </div>

                    {/* Navegación principal - Desktop */}
                    <nav className="nbd-nav">
                        <a href="#productos" className="nbd-nav-link">
                            {t('products')}
                        </a>
                        {topCategories.slice(0, 4).map(category => (
                            <a
                                key={category.id}
                                href={getSubdomainUrl(`/categoria/${category.slug}`)}
                                className="nbd-nav-link"
                                onClick={(e) => {
                                    if (onCategoryClick) {
                                        e.preventDefault();
                                        onCategoryClick(category.slug);
                                    }
                                }}
                            >
                                {category.name}
                            </a>
                        ))}
                    </nav>

                    {/* Acciones del header */}
                    <div className="nbd-header-actions">
                        
                        {/* Búsqueda */}
                        <button 
                            className="nbd-action-btn" 
                            onClick={() => setSearchOpen(true)}
                            aria-label={t('search')}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </button>

                        {/* Carrito */}
                        <button
                            onClick={openCart}
                            className="nbd-cart-btn"
                            aria-label={`${t('cart')} (${state.items.length} ${t('products')})`}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M6 2L3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6l-3-4H6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M16 10c0 2.21-1.79 4-4 4s-4-1.79-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {state.items.length > 0 && (
                                <span className="nbd-cart-badge">{state.items.length}</span>
                            )}
                        </button>

                        {/* Menú móvil */}
                        <button
                            className="nbd-mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Menú de navegación"
                            aria-expanded={mobileMenuOpen}
                        >
                            <div className={`nbd-hamburger ${mobileMenuOpen ? 'nbd-hamburger--open' : ''}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Menú móvil overlay */}
            {mobileMenuOpen && (
                <div className="nbd-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
                    <div className="nbd-mobile-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="nbd-mobile-menu-header">
                            <span className="nbd-mobile-menu-title">Navegación</span>
                            <button
                                className="nbd-mobile-close"
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Cerrar menú"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        
                        <nav className="nbd-mobile-nav">
                            <a
                                href="#productos"
                                className="nbd-mobile-nav-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 7L12 3L4 7L12 11L20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M4 7V17L12 21L20 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {t('products')}
                            </a>
                            
                            {topCategories.map(category => (
                                <a
                                    key={category.id}
                                    href={getSubdomainUrl(`/categoria/${category.slug}`)}
                                    className="nbd-mobile-nav-link"
                                    onClick={(e) => {
                                        setMobileMenuOpen(false);
                                        if (onCategoryClick) {
                                            e.preventDefault();
                                            onCategoryClick(category.slug);
                                        }
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8M16 4V2M16 4V6M8 4V2M8 4V6M8 8H16M8 12H16M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    {category.name}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Componente de Búsqueda */}
            <SearchComponent
                products={products}
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                isCustomDomain={isCustomDomain()}
                storeSubdomain={storeSubdomain}
                storeInfo={storeInfo}
                storeId={storeInfo?.id || null}
                onProductClick={onProductClick}
            />
        </>
    );
}
