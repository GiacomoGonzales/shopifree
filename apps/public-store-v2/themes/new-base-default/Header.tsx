"use client";

import { useEffect, useMemo, useState } from "react";
import { StoreBasicInfo } from "../../lib/store";
import { Category } from "../../lib/categories";
import { toCloudinarySquare } from "../../lib/images";
import { useCart } from "../../lib/cart-context";

type Props = {
    storeInfo: StoreBasicInfo | null;
    categories: Category[] | null;
    storeSubdomain: string;
};

export default function Header({ storeInfo, categories, storeSubdomain }: Props) {
    const [isScrolled, setIsScrolled] = useState(false);
    const { state, openCart } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const locale = useMemo(() => {
        try {
            const parts = window.location.pathname.split("/").filter(Boolean);
            return parts[0] || "es";
        } catch {
            return "es";
        }
    }, []);

    const topCategories = useMemo(() => 
        (Array.isArray(categories) ? categories.filter(c => !c.parentCategoryId) : []), 
        [categories]
    );

    const getSubdomainUrl = (path: string) => `/${locale}/${storeSubdomain}${path}`;

    return (
        <>
            <header className={`nbd-header ${isScrolled ? 'nbd-header--scrolled' : ''}`}>
                <div className="nbd-header-container">
                    
                    {/* Logo y nombre de la tienda */}
                    <div className="nbd-header-brand">
                        <a href={getSubdomainUrl("")} className="nbd-brand-link" aria-label="Ir al inicio">
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
                        <a href="#categorias" className="nbd-nav-link">
                            Categorías
                        </a>
                        <a href="#productos" className="nbd-nav-link">
                            Productos
                        </a>
                        {topCategories.slice(0, 3).map(category => (
                            <a
                                key={category.id}
                                href={getSubdomainUrl(`/categoria/${category.slug}`)}
                                className="nbd-nav-link"
                            >
                                {category.name}
                            </a>
                        ))}
                    </nav>

                    {/* Acciones del header */}
                    <div className="nbd-header-actions">
                        
                        {/* Búsqueda */}
                        <button className="nbd-action-btn" aria-label="Buscar productos">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5S5.806 2 10.5 2S19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        {/* Carrito */}
                        <button
                            onClick={openCart}
                            className="nbd-cart-btn"
                            aria-label={`Carrito (${state.items.length} productos)`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16A2 2 0 0115 18H9A2 2 0 017 16V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                                href="#categorias"
                                className="nbd-mobile-nav-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7M3 7L3 12M3 7H21M21 7V5C21 3.89543 20.1046 3 19 3H17M21 7V12M3 12V19C3 20.1046 3.89543 21 5 21H7M3 12H21M21 12V19C21 20.1046 20.1046 21 19 21H17M7 3V21M17 3V21" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Categorías
                            </a>
                            <a
                                href="#productos"
                                className="nbd-mobile-nav-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 7L12 3L4 7L12 11L20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M4 7V17L12 21L20 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Productos
                            </a>
                            
                            {topCategories.map(category => (
                                <a
                                    key={category.id}
                                    href={getSubdomainUrl(`/categoria/${category.slug}`)}
                                    className="nbd-mobile-nav-link"
                                    onClick={() => setMobileMenuOpen(false)}
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
        </>
    );
}
