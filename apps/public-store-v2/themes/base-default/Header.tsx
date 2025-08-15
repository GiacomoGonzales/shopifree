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
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 10);
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
    
    const subcategoriesByParent = useMemo(() => {
        const map: Record<string, Category[]> = {};
        (Array.isArray(categories) ? categories : []).forEach(c => {
            if (c.parentCategoryId) {
                map[c.parentCategoryId] = map[c.parentCategoryId] || [];
                map[c.parentCategoryId].push(c);
            }
        });
        return map;
    }, [categories]);

    const getSubdomainUrl = (path: string) => `/${locale}/${storeSubdomain}${path}`;

    return (
        <header className={`bd-header ${isScrolled ? 'bd-header--scrolled' : ''}`}>
            <div className="bd-header-container">
                
                {/* Logo y nombre de la tienda */}
                <div className="bd-header-logo">
                    <a href={getSubdomainUrl("")} className="bd-logo-link" aria-label="Ir al inicio de la tienda">
                        {storeInfo?.logoUrl ? (
                            <div className="bd-logo-image">
                                <img 
                                    src={toCloudinarySquare(storeInfo.logoUrl, 200)} 
                                    alt={storeInfo?.storeName || storeSubdomain} 
                                />
                            </div>
                        ) : (
                            <div className="bd-logo-placeholder">
                                <span>{(storeInfo?.storeName || storeSubdomain).charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                        <span className="bd-store-name">
                            {storeInfo?.storeName || storeSubdomain}
                        </span>
                    </a>
                </div>

                {/* Navegación principal - Desktop */}
                <nav className="bd-nav">
                    <div className="bd-nav-items">
                        {topCategories.map(category => {
                            const children = subcategoriesByParent[category.id] || [];
                            const hasChildren = children.length > 0;
                            
                            return (
                                <div
                                    key={category.id}
                                    className="bd-nav-item"
                                    onMouseEnter={() => hasChildren && setHoveredCategory(category.id)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                >
                                    <a 
                                        href={getSubdomainUrl(`/categoria/${category.slug}`)}
                                        className="bd-nav-link"
                                    >
                                        {category.name}
                                        {hasChildren && (
                                            <svg className="bd-nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </a>
                                    
                                    {/* Dropdown de subcategorías */}
                                    {hasChildren && hoveredCategory === category.id && (
                                        <div className="bd-dropdown">
                                            <div className="bd-dropdown-content">
                                                {children.map(subcat => (
                                                    <a
                                                        key={subcat.id}
                                                        href={getSubdomainUrl(`/categoria/${category.slug}/${subcat.slug}`)}
                                                        className="bd-dropdown-link"
                                                    >
                                                        {subcat.name}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </nav>

                {/* Acciones del header */}
                <div className="bd-header-actions">
                    
                    {/* Carrito */}
                    <button
                        onClick={openCart}
                        className="bd-cart-btn"
                        aria-label={`Carrito de compras (${state.items.length} productos)`}
                    >
                        <svg className="bd-cart-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path 
                                d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17A2 2 0 0115 19H9A2 2 0 017 17V13M17 13H7"
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </svg>
                        {state.items.length > 0 && (
                            <span className="bd-cart-badge">{state.items.length}</span>
                        )}
                    </button>

                    {/* Menú móvil */}
                    <button
                        className="bd-mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menú de navegación"
                        aria-expanded={mobileMenuOpen}
                    >
                        <div className={`bd-hamburger ${mobileMenuOpen ? 'bd-hamburger--open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Menú móvil expandido */}
            {mobileMenuOpen && (
                <div className="bd-mobile-menu">
                    <div className="bd-mobile-menu-content">
                        <nav className="bd-mobile-nav">
                            {topCategories.map(category => (
                                <a
                                    key={category.id}
                                    href={getSubdomainUrl(`/categoria/${category.slug}`)}
                                    className="bd-mobile-nav-link"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {category.name}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}
