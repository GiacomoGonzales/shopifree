"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import "./new-base-default.css";
import "./loading-spinner.css";
import LoadingSpinner from "./LoadingSpinner";
import { getStoreIdBySubdomain, getStoreBasicInfo, StoreBasicInfo } from "../../lib/store";
import { getStoreProducts, PublicProduct } from "../../lib/products";
import { getStoreCategories, Category } from "../../lib/categories";
import { getStoreBrands, PublicBrand } from "../../lib/brands";
import { getStoreFilters, Filter } from "../../lib/filters";
import { toCloudinarySquare } from "../../lib/images";
import { formatPrice } from "../../lib/currency";
import { useCart } from "../../lib/cart-context";
import Header from "./Header";
import Footer from "./Footer";
import CartModal from "./CartModal";

type Props = {
    storeSubdomain: string;
    categorySlug?: string;
};

export default function NewBaseDefault({ storeSubdomain, categorySlug }: Props) {
    const t = useTranslations('common');
    const { addItem } = useCart();
    
    // Función para detectar si estamos en un dominio personalizado
    const isCustomDomain = () => {
        if (typeof window === 'undefined') return false;
        const host = window.location.hostname;
        return !host.endsWith('shopifree.app') && !host.endsWith('localhost') && host !== 'localhost';
    };
    
    // Función para construir URLs correctamente según el tipo de dominio
    const buildUrl = (path: string) => {
        if (typeof window === 'undefined') return path;
        
        const locale = window.location.pathname.split('/')[1] || 'es';
        const isCustom = isCustomDomain();
        
        if (isCustom) {
            // En dominio personalizado: NO incluir subdominio
            return `/${locale}${path}`;
        } else {
            // En dominio de plataforma: incluir subdominio
            return `/${locale}/${storeSubdomain}${path}`;
        }
    };
    
    // Detectar si estamos en una página de categoría
    const isOnCategoryPage = !!categorySlug || (typeof window !== 'undefined' && window.location.pathname.includes('/categoria/'));
    const categorySlugFromUrl = categorySlug || (isOnCategoryPage ? 
        window.location.pathname.split('/categoria/')[1]?.split('/')[0] : null);

    const [storeId, setStoreId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<PublicProduct[] | null>(null);
    const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [brands, setBrands] = useState<PublicBrand[] | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(categorySlugFromUrl);
    const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
    const [mobileViewMode, setMobileViewMode] = useState<'expanded' | 'grid' | 'list'>('grid');
    const [productsToShow, setProductsToShow] = useState<number>(8); // Mostrar 8 productos inicialmente
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [currentSort, setCurrentSort] = useState<'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc'>('newest');
    const [filters, setFilters] = useState<Filter[]>([]);
    const [filtersModalOpen, setFiltersModalOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

    // Cargar datos de la tienda
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const id = await getStoreIdBySubdomain(storeSubdomain);
                if (!alive) return;
                setStoreId(id);
                if (id) {
                    const [items, info, cats, brandList, filterList] = await Promise.all([
                        getStoreProducts(id),
                        getStoreBasicInfo(id),
                        getStoreCategories(id),
                        getStoreBrands(id),
                        getStoreFilters(id)
                    ]);
                    if (!alive) return;
                    setProducts(items);
                    setStoreInfo(info);
                    setCategories(cats);
                    setBrands(brandList);
                    setFilters(filterList);
                    
                    console.log("Categorías cargadas:", cats);
                    console.log("Categorías padre:", cats?.filter(c => !c.parentCategoryId));
                    console.log("Productos cargados:", items);
                    console.log("Productos con categoryId:", items.filter(p => p.categoryId));
                    

                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [storeSubdomain]);

    // Asegurar que activeCategory se setee correctamente al recibir categorySlug prop
    useEffect(() => {
        if (categorySlug) {
            setActiveCategory(categorySlug);
        }
    }, [categorySlug]);

    // Resetear paginación cuando cambie la categoría activa
    useEffect(() => {
        setProductsToShow(8);
    }, [activeCategory]);

    // Cerrar dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (sortDropdownOpen && !target.closest('.nbd-sort-dropdown')) {
                setSortDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sortDropdownOpen]);

    // Cerrar modal de filtros con Escape
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && filtersModalOpen) {
                setFiltersModalOpen(false);
            }
        };

        if (filtersModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [filtersModalOpen]);

    // Categorías organizadas
    const topCategories = useMemo(() => 
        (Array.isArray(categories) ? categories.filter(c => !c.parentCategoryId) : []), 
        [categories]
    );

    // Productos filtrados
    const filteredProducts = useMemo(() => {
        const hasProducts = Array.isArray(products) && products.length > 0;
        if (!hasProducts) return [];

        let base = [...products];

        // Filtrar por categoría
        if (activeCategory && activeCategory !== 'todos') {
            const cat = categories?.find(c => c.slug === activeCategory);
            console.log("=== CATEGORY FILTERING DEBUG ===");
            console.log("activeCategory:", activeCategory);
            console.log("categorySlug prop:", categorySlug);
            console.log("isOnCategoryPage:", isOnCategoryPage);
            console.log("Categoría encontrada:", cat);
            console.log("Todas las categorías:", categories?.map(c => ({id: c.id, name: c.name, slug: c.slug})));
            console.log("Todos los productos:", base.map(p => ({name: p.name, categoryId: p.categoryId, selectedParentCategoryIds: p.selectedParentCategoryIds})));
            
            if (cat) {
                const beforeFilter = base.length;
                // Buscar productos que pertenezcan a esta categoría O a sus subcategorías
                const subcategoryIds = categories?.filter(c => c.parentCategoryId === cat.id).map(c => c.id) || [];
                const allCategoryIds = [cat.id, ...subcategoryIds];
                
                // También incluir búsqueda por slug para mayor compatibilidad
                const allCategorySlugs = [cat.slug, ...categories?.filter(c => c.parentCategoryId === cat.id).map(c => c.slug) || []];
                
                base = base.filter(p => {
                    // Buscar por ID de categoría (campo legacy)
                    const matchesById = allCategoryIds.includes(p.categoryId || '');
                    // Buscar por slug de categoría (por si el categoryId es en realidad un slug)
                    const matchesBySlug = allCategorySlugs.includes(p.categoryId || '');
                    // Buscar en selectedParentCategoryIds (campo correcto)
                    const matchesByParentCategories = p.selectedParentCategoryIds?.some(catId => 
                        allCategoryIds.includes(catId) || allCategorySlugs.includes(catId)
                    ) || false;
                    
                    return matchesById || matchesBySlug || matchesByParentCategories;
                });
                
                console.log(`Productos antes del filtro: ${beforeFilter}, después: ${base.length}`);
                console.log("IDs de categorías a buscar:", allCategoryIds);
                console.log("Slugs de categorías a buscar:", allCategorySlugs);
                console.log("Productos filtrados:", base.map(p => ({name: p.name, categoryId: p.categoryId, selectedParentCategoryIds: p.selectedParentCategoryIds})));
            } else {
                console.log("❌ No se encontró la categoría con slug:", activeCategory);
            }
            console.log("=== END CATEGORY FILTERING DEBUG ===");
        }

        // Aplicar filtros seleccionados
        if (Object.keys(selectedFilters).length > 0) {
            console.log("=== APPLYING FILTERS ===");
            console.log("Selected filters:", selectedFilters);
            console.log("First product tags example:", base[0]?.tags);
            
            base = base.filter(product => {
                const productMatches = Object.entries(selectedFilters).every(([filterKey, selectedValues]) => {
                    if (!selectedValues || selectedValues.length === 0) return true;
                    
                    // Los filtros están en el campo 'tags' del producto (que ahora mapea a metaFieldValues)
                    const productTags = product.tags || {};
                    const productFilterValue = productTags[filterKey];
                    
                    console.log(`Product ${product.name}:`);
                    console.log(`  Filter ${filterKey}: productValue="${productFilterValue}", selectedValues:`, selectedValues);
                    
                    // Si el producto no tiene este filtro, no lo incluimos
                    if (!productFilterValue) {
                        console.log(`  ❌ Product has no value for filter ${filterKey}`);
                        return false;
                    }
                    
                    // Verificar si alguno de los valores seleccionados coincide
                    // Manejar tanto strings como arrays
                    let matches = false;
                    if (Array.isArray(productFilterValue)) {
                        matches = productFilterValue.some(val => selectedValues.includes(val));
                    } else {
                        matches = selectedValues.includes(productFilterValue);
                    }
                    
                    console.log(`  ${matches ? '✅' : '❌'} Filter match: ${matches}`);
                    return matches;
                });
                
                console.log(`Product ${product.name} overall match: ${productMatches}`);
                return productMatches;
            });
            
            console.log(`Productos después de filtros: ${base.length}`);
        }

        return base;
    }, [products, categories, activeCategory, selectedFilters]);

    // Productos ordenados
    const sortedProducts = useMemo(() => {
        if (!filteredProducts || filteredProducts.length === 0) return [];
        
        const sorted = [...filteredProducts];
        
        switch (currentSort) {
            case 'newest':
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA; // Más reciente primero
                });
            case 'oldest':
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateA - dateB; // Más antiguo primero
                });
            case 'price-low':
                return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price-high':
                return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return sorted;
        }
    }, [filteredProducts, currentSort]);

    // Productos a mostrar con paginación
    const displayedProducts = useMemo(() => {
        return sortedProducts.slice(0, productsToShow);
    }, [sortedProducts, productsToShow]);

    // Función para cargar más productos
    const loadMoreProducts = () => {
        setProductsToShow(prev => prev + 8);
    };

    // Funciones para el dropdown de ordenamiento
    const handleSortChange = (sortType: typeof currentSort) => {
        setCurrentSort(sortType);
        setSortDropdownOpen(false);
        setProductsToShow(8); // Resetear paginación al cambiar orden
    };

    const toggleSortDropdown = () => {
        setSortDropdownOpen(!sortDropdownOpen);
    };

    // Opciones de ordenamiento
    const sortOptions = [
        { value: 'newest', label: 'Más recientes' },
        { value: 'oldest', label: 'Más antiguos' },
        { value: 'price-low', label: 'Precio: menor a mayor' },
        { value: 'price-high', label: 'Precio: mayor a menor' },
        { value: 'name-asc', label: 'Nombre: A-Z' },
        { value: 'name-desc', label: 'Nombre: Z-A' }
    ] as const;

    // Funciones para manejar filtros
    const toggleFiltersModal = () => {
        setFiltersModalOpen(!filtersModalOpen);
    };

    const handleFilterChange = (filterKey: string, optionValue: string, checked: boolean) => {
        console.log(`Filter change: ${filterKey} = "${optionValue}" (${checked})`);
        setSelectedFilters(prev => {
            const current = prev[filterKey] || [];
            
            if (checked) {
                // Agregar la opción si está marcada
                const newFilters = {
                    ...prev,
                    [filterKey]: [...current, optionValue]
                };
                console.log('New selected filters:', newFilters);
                return newFilters;
            } else {
                // Remover la opción si está desmarcada
                const updated = current.filter(val => val !== optionValue);
                if (updated.length === 0) {
                    const { [filterKey]: removed, ...rest } = prev;
                    console.log('New selected filters (removed key):', rest);
                    return rest;
                } else {
                    const newFilters = {
                        ...prev,
                        [filterKey]: updated
                    };
                    console.log('New selected filters (updated):', newFilters);
                    return newFilters;
                }
            }
        });
        
        // Resetear paginación al cambiar filtros
        setProductsToShow(8);
    };

    const clearAllFilters = () => {
        setSelectedFilters({});
        setProductsToShow(8);
    };

    const getActiveFiltersCount = () => {
        return Object.values(selectedFilters).reduce((sum, values) => sum + values.length, 0);
    };

    // Función para agregar producto al carrito
    const handleAddToCart = (product: PublicProduct) => {
        addItem({
            id: product.id, // Campo requerido por CartItem
            productId: product.id,
            name: product.name,
            price: product.price,
            currency: storeInfo?.currency || 'COP',
            image: product.image || '',
            slug: product.slug || product.id
        }, 1);
        
        // Feedback visual opcional (puede implementarse después)
        console.log(`Agregado al carrito: ${product.name}`);
    };

    // Verificar si hay más productos para mostrar
    const hasMoreProducts = sortedProducts.length > productsToShow;

    if (loading) {
        return <LoadingSpinner />;
    }

    // Encontrar la categoría actual si estamos en una página de categoría
    const currentCategory = isOnCategoryPage ? 
        categories?.find(c => c.slug === categorySlugFromUrl) : null;

    return (
        <div data-theme="new-base-default" className="nbd-theme">
            <Header storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} products={products || []} />
            
            {/* Si estamos en una página de categoría, mostrar header limpio */}
            {isOnCategoryPage && currentCategory && (
                <div className="nbd-category-page-header">
                    <div className="nbd-container">
                        <h1 className="nbd-category-title">{currentCategory.name}</h1>
                        {currentCategory.description && (
                            <p className="nbd-category-description">{currentCategory.description}</p>
                        )}
                        
                        {/* Breadcrumbs debajo del título */}
                        <nav className="nbd-category-breadcrumbs">
                            <a href={buildUrl('')} className="nbd-breadcrumb-link">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Inicio
                            </a>
                            <span className="nbd-breadcrumbs-sep">/</span>
                            <span className="nbd-breadcrumb-current">{currentCategory.name}</span>
                        </nav>
                    </div>
                </div>
            )}
            
            {/* Hero Section Moderno - Solo en home */}
            {!isOnCategoryPage && (
            <section className="nbd-hero">
                <div className="nbd-hero-container">
                    <div className="nbd-hero-content">
                        <div className="nbd-hero-text">
                            <h1 className="nbd-hero-title">
                                {storeInfo?.storeName || storeSubdomain}
                            </h1>
                            {storeInfo?.description && (
                                <p className="nbd-hero-description">
                                    {storeInfo.description}
                                </p>
                            )}
                            <div className="nbd-hero-actions">
                                <a href="#productos" className="nbd-btn nbd-btn--primary">
                                    <span>Explorar productos</span>
                                    <svg className="nbd-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </a>
                                <a href="#categorias" className="nbd-btn nbd-btn--secondary">
                                    Ver categorías
                                </a>
                            </div>
                        </div>
                        
                        <div className="nbd-hero-visual">
                            {storeInfo?.heroImageUrl ? (
                                <div className="nbd-hero-image">
                                    <img
                                        src={toCloudinarySquare(storeInfo.heroImageUrl, 1200)}
                                        alt={storeInfo.storeName || 'Hero'}
                                        className="nbd-hero-img"
                                    />
                                    <div className="nbd-hero-image-overlay"></div>
                                </div>
                            ) : (
                                <div className="nbd-hero-placeholder">
                                    <div className="nbd-placeholder-grid">
                                        <div className="nbd-placeholder-item"></div>
                                        <div className="nbd-placeholder-item"></div>
                                        <div className="nbd-placeholder-item"></div>
                                        <div className="nbd-placeholder-item"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* Sección de categorías con mosaico inteligente - Solo en home */}
            {!isOnCategoryPage && (() => {
                // Preparar categorías para mostrar (priorizando padre sobre subcategorías)
                const allCategories = Array.isArray(categories) ? categories : [];
                const parentCategories = allCategories.filter(c => !c.parentCategoryId);
                const subcategories = allCategories.filter(c => c.parentCategoryId);
                
                // Combinar y limitar a 10 máximo
                const categoriesToShow = [
                    ...parentCategories,
                    ...subcategories.filter(sub => 
                        !parentCategories.some(parent => parent.id === sub.parentCategoryId) || 
                        parentCategories.length < 5
                    )
                ].slice(0, 10);

                // Solo mostrar si hay 3 o más categorías
                if (categoriesToShow.length < 3) return null;

                // Determinar layout basado en cantidad
                const getLayoutClass = (count: number) => {
                    if (count === 3) return 'nbd-mosaic-3';
                    if (count === 4) return 'nbd-mosaic-4';
                    if (count === 5) return 'nbd-mosaic-5';
                    if (count === 6) return 'nbd-mosaic-6';
                    return 'nbd-mosaic-many';
                };

                return (
                    <section id="categorias" className="nbd-categories-mosaic">
                <div className="nbd-container">
                    <div className="nbd-section-header">
                                <h2 className="nbd-section-title">Categorías</h2>
                            </div>
                            
                            <div className={`nbd-mosaic-grid ${getLayoutClass(categoriesToShow.length)}`}>
                                {categoriesToShow.map((category, index) => {
                                    // Contar productos en esta categoría y sus subcategorías
                                    const subcategoryIds = categories?.filter(c => c.parentCategoryId === category.id).map(c => c.id) || [];
                                    const allCategoryIds = [category.id, ...subcategoryIds];
                                    const productCount = products?.filter(p => allCategoryIds.includes(p.categoryId || '')).length || 0;
                                    const isParent = !category.parentCategoryId;
                                    const isFeatured = index < 2; // Primeras 2 categorías son destacadas
                                    
                                    return (
                                        <a
                                            key={category.id}
                                            href={buildUrl(`/categoria/${category.slug}`)}
                                            className={`nbd-mosaic-card ${activeCategory === category.slug ? 'nbd-mosaic-card--active' : ''} ${
                                                isFeatured ? 'nbd-mosaic-card--featured' : ''
                                            } ${isParent ? 'nbd-mosaic-card--parent' : 'nbd-mosaic-card--sub'}`}
                                        >
                                            {/* Imagen de fondo */}
                                            <div className="nbd-mosaic-background">
                                                {category.imageUrl ? (
                                                    <img
                                                        src={toCloudinarySquare(category.imageUrl, 800)}
                                                        alt={category.name}
                                                        className="nbd-mosaic-image"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            const parent = target.parentElement as HTMLElement;
                                                            target.style.display = 'none';
                                                            if (parent) {
                                                                parent.classList.add('nbd-mosaic-fallback-active');
                                                            }
                                                        }}
                                                    />
                                                ) : null}
                                                
                                                {/* Fallback pattern */}
                                                <div className={`nbd-mosaic-fallback ${!category.imageUrl ? 'nbd-mosaic-fallback-active' : ''}`}>
                                                    <div className="nbd-mosaic-pattern">
                                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                                            <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Overlay para legibilidad */}
                                            <div className="nbd-mosaic-overlay"></div>
                                            
                                            {/* Contenido */}
                                            <div className="nbd-mosaic-content">
                                                <div className="nbd-mosaic-text">
                                                    <h3 className="nbd-mosaic-title">{category.name}</h3>
                                                    {category.description && (
                                                        <p className="nbd-mosaic-description">
                                                            {category.description}
                                                        </p>
                                                    )}
                                                    <p className="nbd-mosaic-count">
                                                        {productCount} {productCount === 1 ? 'producto' : 'productos'}
                                                    </p>
                                                </div>
                                                
                                                <div className="nbd-mosaic-arrow">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })}
                    </div>
                        </div>
                    </section>
                );
            })()}

            {/* Sección de productos */}
            <section id="productos" className="nbd-products">
                <div className="nbd-container">
                    {/* Solo mostrar header de productos en home, no en páginas de categoría */}
                    {!isOnCategoryPage && (
                        <div className="nbd-section-header">
                            <h2 className="nbd-section-title">
                                {activeCategory ? 
                                    `${categories?.find(c => c.slug === activeCategory)?.name || 'Productos'}` : 
                                    'Nuestros productos'
                                }
                            </h2>
                        </div>
                    )}

                    {/* Controles de productos */}
                    <div className="nbd-product-controls">
                        
                        {/* Filtros */}
                        <button 
                            className={`nbd-control-btn ${getActiveFiltersCount() > 0 ? 'nbd-control-btn--active' : ''}`}
                            onClick={toggleFiltersModal}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>Filtros</span>
                            {getActiveFiltersCount() > 0 && (
                                <span className="nbd-filter-badge">{getActiveFiltersCount()}</span>
                            )}
                        </button>

                        {/* Ordenar */}
                        <div className="nbd-sort-dropdown">
                            <button 
                                className={`nbd-control-btn ${sortDropdownOpen ? 'nbd-control-btn--active' : ''}`}
                                onClick={toggleSortDropdown}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 7h3m0 0l3-3m-3 3l3 3M3 17h9m0 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>Ordenar</span>
                                <svg 
                                    width="12" height="12" 
                                    viewBox="0 0 24 24" 
                                    fill="none"
                                    className={`nbd-dropdown-arrow ${sortDropdownOpen ? 'nbd-dropdown-arrow--open' : ''}`}
                                >
                                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            
                            {sortDropdownOpen && (
                                <div className="nbd-dropdown-menu">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            className={`nbd-dropdown-option ${currentSort === option.value ? 'nbd-dropdown-option--active' : ''}`}
                                            onClick={() => handleSortChange(option.value)}
                                        >
                                            {option.label}
                                            {currentSort === option.value && (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Vista */}
                        <button 
                            className="nbd-control-btn nbd-view-btn"
                            onClick={() => {
                                setMobileViewMode(prev => {
                                    if (prev === 'expanded') return 'grid';
                                    if (prev === 'grid') return 'list';
                                    return 'expanded';
                                });
                            }}
                            title={`Vista actual: ${
                                mobileViewMode === 'grid' ? '2 por fila' : 
                                mobileViewMode === 'expanded' ? 'Expandida' : 
                                'Lista'
                            }`}
                        >
                            {mobileViewMode === 'expanded' && (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.5" rx="2"/>
                                </svg>
                            )}
                            {mobileViewMode === 'grid' && (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
                                    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
                                    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
                                    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
                                </svg>
                            )}
                            {mobileViewMode === 'list' && (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                            )}
                            <span>Vista</span>
                        </button>
                    </div>

                    <div className={`nbd-products-grid nbd-mobile-${mobileViewMode}`}>
                        {displayedProducts.length > 0 ? (
                            displayedProducts.map((product) => (
                                <div 
                                    key={product.id} 
                                    className="nbd-product-card"
                                    onClick={() => {
                                        window.location.href = buildUrl(`/producto/${product.slug || product.id}`);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="nbd-product-image">
                                        {(() => {
                                            const imageUrl = product.image || product.mediaFiles?.[0]?.url;
                                            
                                            if (!imageUrl) return null;
                                            
                                            // Generar diferentes tamaños optimizados para móvil y retina
                                            const src600 = toCloudinarySquare(imageUrl, 600);   // Para móvil normal
                                            const src800 = toCloudinarySquare(imageUrl, 800);   // Para móvil retina
                                            const src1200 = toCloudinarySquare(imageUrl, 1200); // Para tablet retina
                                            const src1600 = toCloudinarySquare(imageUrl, 1600); // Para desktop retina
                                            
                                            return (
                                                <img
                                                    src={src800}
                                                    srcSet={`${src600} 600w, ${src800} 800w, ${src1200} 1200w, ${src1600} 1600w`}
                                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                                    alt={product.name}
                                                    className="nbd-product-img"
                                                    loading="lazy"
                                                    decoding="async"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const placeholder = e.currentTarget.parentElement?.querySelector('.nbd-product-placeholder-hidden');
                                                        if (placeholder) {
                                                            (placeholder as HTMLElement).style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                            );
                                        })()}
                                        
                                        <div className="nbd-product-placeholder nbd-product-placeholder-hidden" style={{ display: 'none' }}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                                <path d="M4 16L4 18C4 19.1046 4.89543 20 6 20L18 20C19.1046 20 20 19.1046 20 18L20 16M16 12L12 16M12 16L8 12M12 16L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span className="nbd-placeholder-text">Sin imagen</span>
                                        </div>
                                        
                                        {!product.image && !product.mediaFiles?.[0]?.url && (
                                            <div className="nbd-product-placeholder">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                                    <path d="M4 16L4 18C4 19.1046 4.89543 20 6 20L18 20C19.1046 20 20 19.1046 20 18L20 16M16 12L12 16M12 16L8 12M12 16L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span className="nbd-placeholder-text">Sin imagen</span>
                                            </div>
                                        )}
                                        
                                        {product.comparePrice && product.comparePrice > product.price && (
                                            <div className="nbd-product-badge">
                                                Oferta
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="nbd-product-content">
                                        <h3 className="nbd-product-name">{product.name}</h3>
                                        
                                        <div className="nbd-product-footer">
                                            <div className="nbd-product-price">
                                                {product.comparePrice && product.comparePrice > product.price ? (
                                                    <>
                                                        <span className="nbd-price-current">{formatPrice(product.price, storeInfo?.currency)}</span>
                                                        <span className="nbd-price-original">{formatPrice(product.comparePrice, storeInfo?.currency)}</span>
                                                    </>
                                                ) : (
                                                    <span className="nbd-price-current">{formatPrice(product.price, storeInfo?.currency)}</span>
                                                )}
                                            </div>
                                            
                                            <button 
                                                className="nbd-add-to-cart"
                                                onClick={() => handleAddToCart(product)}
                                                aria-label={`Agregar ${product.name} al carrito`}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="nbd-empty-state">
                                <div className="nbd-empty-icon">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 7L12 3L4 7L12 11L20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M4 7V17L12 21L20 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h3 className="nbd-empty-title">No hay productos en esta categoría</h3>
                                <p className="nbd-empty-description">Explora otras categorías o vuelve más tarde</p>
                            </div>
                        )}
                    </div>

                    {/* Botón "Cargar más" */}
                    {hasMoreProducts && (
                        <div style={{ 
                            textAlign: 'center', 
                            marginTop: 'var(--nbd-space-4xl)', 
                            marginBottom: 'var(--nbd-space-2xl)' 
                        }}>
                            <button 
                                onClick={loadMoreProducts}
                                className="nbd-btn nbd-btn--outline"
                                style={{
                                    minWidth: '200px',
                                    transition: 'all var(--nbd-transition-base)'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <span>Cargar más productos ({Math.min(8, filteredProducts.length - productsToShow)})</span>
                            </button>
                            <p style={{
                                fontSize: 'var(--nbd-font-size-sm)',
                                color: 'var(--nbd-neutral-600)',
                                marginTop: 'var(--nbd-space-md)',
                                marginBottom: '0'
                            }}>
                                Mostrando {displayedProducts.length} de {filteredProducts.length} productos
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Sección de Newsletter */}
            {!isOnCategoryPage && (
            <section className="nbd-newsletter">
                <div className="nbd-container">
                    <div className="nbd-newsletter-content">
                        <div className="nbd-newsletter-text">
                            <div className="nbd-newsletter-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h2 className="nbd-newsletter-title">
                                Mantente al día con nuestras ofertas
                            </h2>
                            <p className="nbd-newsletter-description">
                                Suscríbete a nuestro newsletter y recibe las últimas novedades, ofertas exclusivas y descuentos especiales directamente en tu correo.
                            </p>
                        </div>
                        
                        <div className="nbd-newsletter-form-wrapper">
                            <form className="nbd-newsletter-form" onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                                
                                if (email) {
                                    // Simulación de suscripción exitosa
                                    const button = form.querySelector('.nbd-newsletter-submit') as HTMLButtonElement;
                                    const originalText = button.innerHTML;
                                    button.innerHTML = `
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>¡Suscrito!</span>
                                    `;
                                    button.disabled = true;
                                    button.style.background = 'var(--nbd-success)';
                                    
                                    setTimeout(() => {
                                        button.innerHTML = originalText;
                                        button.disabled = false;
                                        button.style.background = '';
                                        form.reset();
                                    }, 3000);
                                }
                            }}>
                                <div className="nbd-newsletter-input-group">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="tu@email.com"
                                        className="nbd-newsletter-input"
                                        autoComplete="email"
                                        required
                                    />
                                    <button type="submit" className="nbd-newsletter-submit">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                        <span>Suscribirse</span>
                                    </button>
                                </div>
                                <p className="nbd-newsletter-privacy">
                                    Al suscribirte, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* Sección de Marcas Carousel - Solo en home */}
            {!isOnCategoryPage && brands && brands.length > 0 && (
                <section className="nbd-brands-carousel">
                    <div className="nbd-container">
                        <div className="nbd-section-header">
                            <h2 className="nbd-section-title">Nuestras marcas</h2>
                            <p className="nbd-section-subtitle">
                                Trabajamos con las mejores marcas para ofrecerte calidad garantizada
                            </p>
                        </div>
                        
                        <div className="nbd-brands-container">
                            <div className="nbd-brands-track" 
                                 style={{ 
                                     '--brands-count': brands.length,
                                     '--animation-duration': `${brands.length * 4}s`
                                 } as React.CSSProperties}>
                                {/* Duplicar las marcas para efecto infinito */}
                                {[...brands, ...brands].map((brand, index) => (
                                    <div key={`${brand.id}-${index}`} className="nbd-brand-item">
                                        {brand.image ? (
                                            <img
                                                src={toCloudinarySquare(brand.image, 400)}
                                                alt={brand.name}
                                                className="nbd-brand-image"
                                                loading="lazy"
                                                onError={(e) => {
                                                    // Si falla la imagen, mostrar solo el nombre
                                                    const target = e.currentTarget;
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        target.style.display = 'none';
                                                        parent.innerHTML = `<div class="nbd-brand-fallback">${brand.name}</div>`;
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="nbd-brand-fallback">
                                                {brand.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <Footer storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} />

            {/* Modal de Filtros */}
            {filtersModalOpen && (
                <div className="nbd-modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setFiltersModalOpen(false);
                    }
                }}>
                    <div className="nbd-modal-content nbd-filters-modal">
                        {/* Header del modal */}
                        <div className="nbd-modal-header">
                            <h3 className="nbd-modal-title">Filtros</h3>
                            <button 
                                className="nbd-modal-close"
                                onClick={() => setFiltersModalOpen(false)}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>

                        {/* Contenido del modal */}
                        <div className="nbd-modal-body">
                            {filters.length === 0 ? (
                                <div className="nbd-no-filters">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                    <h4>No hay filtros disponibles</h4>
                                    <p>Los filtros se configuran desde el panel de administración.</p>
                                </div>
                            ) : (
                                <div className="nbd-filters-list">
                                    {filters.map((filter) => (
                                        <div key={filter.id} className="nbd-filter-group">
                                            <h4 className="nbd-filter-title">{filter.name}</h4>
                                            <div className="nbd-filter-options">
                                                {Object.entries(filter.options || {}).map(([optionKey, optionLabel]) => {
                                                    const isSelected = selectedFilters[filter.id]?.includes(optionLabel) || false;
                                                    return (
                                                        <label key={optionKey} className={`nbd-filter-option ${isSelected ? 'nbd-filter-option--selected' : ''}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => handleFilterChange(filter.id, optionLabel, e.target.checked)}
                                                                className="nbd-filter-checkbox"
                                                            />
                                                            <span className="nbd-filter-checkmark"></span>
                                                            <span className="nbd-filter-label">{optionLabel}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer del modal */}
                        {filters.length > 0 && (
                            <div className="nbd-modal-footer">
                                <button 
                                    className="nbd-btn nbd-btn--ghost"
                                    onClick={clearAllFilters}
                                    disabled={getActiveFiltersCount() === 0}
                                >
                                    Limpiar filtros
                                </button>
                                <button 
                                    className="nbd-btn nbd-btn--primary"
                                    onClick={() => setFiltersModalOpen(false)}
                                >
                                    Aplicar ({getActiveFiltersCount()})
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal del carrito */}
            <CartModal />
        </div>
    );
}
