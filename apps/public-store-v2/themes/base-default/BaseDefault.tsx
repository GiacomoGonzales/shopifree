"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import "./base-default.css";
import { getStoreIdBySubdomain, getStoreBasicInfo, StoreBasicInfo } from "../../lib/store";
import { getStoreProducts, PublicProduct } from "../../lib/products";
import { getStoreCategories, Category } from "../../lib/categories";
import { getStoreBrands, PublicBrand } from "../../lib/brands";
import { toCloudinarySquare } from "../../lib/images";
import Header from "./Header";
import Footer from "./Footer";

type Props = {
    storeSubdomain: string;
};

export default function BaseDefault({ storeSubdomain }: Props) {
    const t = useTranslations('common');

    const [storeId, setStoreId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<PublicProduct[] | null>(null);
    const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [brands, setBrands] = useState<PublicBrand[] | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
    const [mobileView, setMobileView] = useState<"expanded" | "grid2" | "list">("expanded");
    type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
    const [sortOption, setSortOption] = useState<SortOption>("relevance");
    const [showSort, setShowSort] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [onlyOnSale, setOnlyOnSale] = useState<boolean>(false);
    const [withVideo, setWithVideo] = useState<boolean>(false);

    // Cargar datos de la tienda
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const id = await getStoreIdBySubdomain(storeSubdomain);
                if (!alive) return;
                setStoreId(id);
                if (id) {
                    const [items, info, cats, brandList] = await Promise.all([
                        getStoreProducts(id),
                        getStoreBasicInfo(id),
                        getStoreCategories(id),
                        getStoreBrands(id)
                    ]);
                    if (!alive) return;
                    setProducts(items);
                    setStoreInfo(info);
                    setCategories(cats);
                    setBrands(brandList);
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [storeSubdomain]);

    // Categorías organizadas
    const topCategories = useMemo(() => (Array.isArray(categories) ? categories.filter(c => !c.parentCategoryId) : []), [categories]);
    
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

    // Productos filtrados y ordenados
    const filteredProducts = useMemo(() => {
        const hasProducts = Array.isArray(products) && products.length > 0;
        if (!hasProducts) return [];

        let base = [...products];

        // Filtrar por categoría
        if (activeCategory && activeCategory !== 'todos') {
            const cat = categories?.find(c => c.slug === activeCategory);
            if (cat) {
                base = base.filter(p => p.categoryId === cat.id);
            }
        }

        // Filtros adicionales
        if (onlyOnSale) {
            base = base.filter(p => p.comparePrice && p.comparePrice > (p.price || 0));
        }
        if (withVideo) {
            base = base.filter(p => p.video);
        }

        // Ordenamiento
        switch (sortOption) {
            case "price-asc":
                base.sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY));
                break;
            case "price-desc":
                base.sort((a, b) => (b.price ?? Number.NEGATIVE_INFINITY) - (a.price ?? Number.NEGATIVE_INFINITY));
                break;
            case "name-asc":
                base.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
                break;
            case "name-desc":
                base.sort((a, b) => String(b.name || "").localeCompare(String(a.name || "")));
                break;
            default:
                break;
        }
        return base;
    }, [products, categories, activeCategory, sortOption, onlyOnSale, withVideo]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-3"></div>
                <p className="text-gray-600 text-sm">Cargando...</p>
            </div>
        );
    }

    return (
        <div data-theme="base-default" className="bd-theme">
            <Header storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} />
            
            {/* Hero Section - Base Default Style */}
            <section className="bd-hero">
                <div className="bd-hero-container">
                    <div className="bd-hero-grid">
                        
                        {/* Contenido principal */}
                        <div className="bd-hero-content">
                            <div className="bd-hero-text animate-fadeInUp">
                                <h1 className="bd-hero-title">
                                    {storeInfo?.storeName || storeSubdomain}
                                </h1>
                                {storeInfo?.description && (
                                    <p className="bd-hero-description">
                                        {storeInfo.description}
                                    </p>
                                )}
                            </div>
                            
                            <div className="bd-hero-actions animate-fade-in">
                                <a href="#productos" className="btn-base-primary">
                                    <span>{t('catalog')}</span>
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </a>
                                <a href="#ofertas" className="btn-base-secondary">
                                    {t('offers')}
                                </a>
                            </div>
                        </div>

                        {/* Imagen hero */}
                        <div className="bd-hero-image">
                            <div className="bd-image-container">
                                {storeInfo?.heroImageUrl ? (
                                    <img
                                        src={toCloudinarySquare(storeInfo.heroImageUrl, 1200)}
                                        alt={storeInfo.storeName || 'Hero'}
                                        className="bd-hero-img"
                                    />
                                ) : (
                                    <div className="bd-hero-placeholder">
                                        <div className="bd-placeholder-content">
                                            <div className="bd-placeholder-icon">
                                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="bd-placeholder-text">Imagen de presentación</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Elemento decorativo */}
                            <div className="bd-hero-decoration" />
                        </div>
                    </div>
                </div>
                
                {/* Elementos decorativos de fondo */}
                <div className="bd-hero-bg-elements">
                    <div className="bd-bg-element bd-bg-element-1" />
                    <div className="bd-bg-element bd-bg-element-2" />
                    <div className="bd-bg-element bd-bg-element-3" />
                </div>
            </section>

            {/* Sección de productos */}
            <section id="productos" className="bd-products">
                <div className="bd-products-container">
                    
                    {/* Header de productos */}
                    <div className="bd-products-header">
                        <div className="bd-products-title">
                            <h2>{t('nav.categories')}</h2>
                            <p>Descubre nuestra selección de productos</p>
                        </div>
                        
                        {/* Navegación de categorías */}
                        <div className="bd-categories-nav">
                            <button
                                className={`bd-category-btn ${!activeCategory ? "bd-category-btn--active" : ""}`}
                                onClick={() => setActiveCategory(null)}
                            >
                                {t('all')}
                            </button>
                            {topCategories.map((category) => (
                                <button
                                    key={category.id}
                                    className={`bd-category-btn ${activeCategory === category.slug ? "bd-category-btn--active" : ""}`}
                                    onClick={() => setActiveCategory(category.slug)}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid de productos */}
                    <div className="bd-products-grid grid-base grid-base-products">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} className="card-base bd-product-card">
                                    <div className="bd-product-image">
                                        {product.image ? (
                                            <img
                                                src={toCloudinarySquare(product.image, 400)}
                                                alt={product.name}
                                                className="bd-product-img"
                                            />
                                        ) : (
                                            <div className="bd-product-placeholder">
                                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="bd-product-info">
                                        <h3 className="bd-product-name">{product.name}</h3>
                                        {product.description && (
                                            <p className="bd-product-description">{product.description}</p>
                                        )}
                                        
                                        <div className="bd-product-price">
                                            {product.comparePrice && product.comparePrice > product.price ? (
                                                <>
                                                    <span className="bd-price-original">${product.comparePrice}</span>
                                                    <span className="bd-price-discount">${product.price}</span>
                                                </>
                                            ) : (
                                                <span className="bd-price-current">${product.price}</span>
                                            )}
                                        </div>
                                        
                                        <button className="btn-base-primary bd-add-to-cart">
                                            Agregar al carrito
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bd-no-products">
                                <p>No hay productos disponibles en esta categoría</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} />
        </div>
    );
}
