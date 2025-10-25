"use client";

import { useEffect, useState, useMemo, startTransition } from "react";
import "./restaurant.css";
import "./loading-spinner.css";
import "./texture-backgrounds.css";
import "./utilities.css";
import "./announcement-bar-animations.css";
import { getStoreIdBySubdomain, getStoreBasicInfo, StoreBasicInfo, getStoreBackgroundTexture, applyStoreColors } from "../../lib/store";
import { getStoreProducts, PublicProduct } from "../../lib/products";
import { getStoreParentCategories, Category } from "../../lib/categories";
import { getStoreCollections, PublicCollection } from "../../lib/collections";
import { toCloudinarySquare } from "../../lib/images";
import { formatPrice } from "../../lib/currency";
import { useCart } from "../../lib/cart-context";
import { useStoreLanguage } from "../../lib/store-language-context";
import Header from "../new-base-default/Header";
import Footer from "../new-base-default/Footer";
import CartModal from "../new-base-default/CartModal";
import ProductQuickView from "../new-base-default/components/ProductQuickView";
import AnnouncementBar from "../new-base-default/AnnouncementBar";
import { HeroSection, ProductsGrid, CategoriesSection, ProductSectionHeader, SimpleCarousel, ProductFilters } from "../../components/shared";
import RestaurantCategoryCarousel from "./components/RestaurantCategoryCarousel";
import RestaurantCollectionCarousel from "./components/RestaurantCollectionCarousel";

type Props = {
    storeSubdomain: string;
    effectiveLocale: string;
    storeId?: string | null;
};

export default function Restaurant({ storeSubdomain, effectiveLocale, storeId }: Props) {
    const { t, language } = useStoreLanguage();
    const { addItem, openCart, state: cartState } = useCart();

    // Wrapper para toCloudinarySquare que siempre retorna string
    const toCloudinarySquareWrapper = (url: string, size: number): string => {
        return toCloudinarySquare(url, size) || url;
    };

    // Wrapper para t que acepta cualquier string
    const tWrapper = (key: string): string => {
        return t(key as any);
    };

    const [storeIdState, setStoreIdState] = useState<string | null>(null);
    const resolvedStoreId = storeId || storeIdState;
    const [loading, setLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<PublicProduct[] | null>(null);
    const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [collections, setCollections] = useState<PublicCollection[] | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>('todos'); // Categoría activa para filtrar
    const [activeCollection, setActiveCollection] = useState<string | null>(null); // Colección activa para filtrar
    const [backgroundTexture, setBackgroundTexture] = useState<string>('default');
    const [mobileViewMode, setMobileViewMode] = useState<'expanded' | 'grid' | 'list'>('grid');
    const [productsToShow, setProductsToShow] = useState<number>(8);
    const [loadingCartButton, setLoadingCartButton] = useState<string | null>(null);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [currentSort, setCurrentSort] = useState<'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc'>('newest');

    // Estados para el modal de vista rápida de producto
    const [quickViewProduct, setQuickViewProduct] = useState<PublicProduct | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Cargar textura de fondo configurada
    useEffect(() => {
        if (resolvedStoreId) {
            loadBackgroundTexture(resolvedStoreId);
        }
    }, [resolvedStoreId]);

    const loadBackgroundTexture = async (storeId: string) => {
        try {
            const texture = await getStoreBackgroundTexture(storeId);
            setBackgroundTexture(texture || 'default');
        } catch (error) {
            // Error loading texture
        }
    };

    // Determinar la clase de textura
    const getTextureClass = () => {
        if (backgroundTexture === 'default') return '';
        return `texture-${backgroundTexture}`;
    };

    // Aplicar colores dinámicos de la tienda
    useEffect(() => {
        if (storeInfo?.primaryColor) {
            applyStoreColors(storeInfo.primaryColor, storeInfo.secondaryColor);

            setTimeout(() => {
                applyStoreColors(storeInfo.primaryColor!, storeInfo.secondaryColor);
            }, 100);
        }
    }, [storeInfo?.primaryColor, storeInfo?.secondaryColor]);

    // Agregar clase al body cuando hay announcement bar activo
    useEffect(() => {
        const hasAnnouncementBar = storeInfo?.announcementBar?.enabled === true;

        if (typeof document !== 'undefined') {
            if (hasAnnouncementBar) {
                document.body.classList.add('has-announcement-bar');
            } else {
                document.body.classList.remove('has-announcement-bar');
            }
        }
    }, [storeInfo?.announcementBar?.enabled]);

    // Interceptar click del botón "Explorar productos" para scroll dinámico
    useEffect(() => {
        const handleExploreClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a[href="#productos"]');

            if (link) {
                e.preventDefault();

                let targetElement = null;

                // Buscar el PRIMER carrusel de CATEGORÍAS
                const hasCategories = categories && categories.length > 0;

                if (hasCategories) {
                    // Buscar el primer carrusel de categoría
                    targetElement = document.querySelector('[data-category-slug]');
                }

                // Si no hay carruseles de categorías, ir al grid de productos
                if (!targetElement) {
                    targetElement = document.querySelector('#productos');
                }

                if (targetElement) {
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - 110; // 110px de offset para header

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        };

        document.addEventListener('click', handleExploreClick);
        return () => document.removeEventListener('click', handleExploreClick);
    }, [categories, collections]);

    // Cargar datos de la tienda
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const id = await getStoreIdBySubdomain(storeSubdomain);
                if (!alive) return;
                setStoreIdState(id);
                if (id) {
                    const [items, info, cats, colls] = await Promise.all([
                        getStoreProducts(id),
                        getStoreBasicInfo(id),
                        getStoreParentCategories(id), // Solo categorías padre para filtros
                        getStoreCollections(id) // Colecciones visibles
                    ]);
                    if (!alive) return;
                    startTransition(() => {
                        setProducts(items);
                        setCategories(cats);
                        setCollections(colls);
                        setStoreInfo(info);
                    });
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [storeSubdomain]);

    // Productos filtrados por categoría o colección (solo cuando hay filtro activo - "Ver todos")
    const filteredProducts = useMemo(() => {
        const hasProducts = Array.isArray(products) && products.length > 0;
        if (!hasProducts) return [];

        let base = [...products];

        // Filtrar por colección activa (prioridad sobre categoría)
        if (activeCollection) {
            const collection = collections?.find(c => c.slug === activeCollection);
            if (collection) {
                base = base.filter(p => collection.productIds?.includes(p.id || ''));
            }
        }
        // Filtrar por categoría activa
        else if (activeCategory && activeCategory !== 'todos') {
            const cat = categories?.find(c => c.slug === activeCategory);

            if (cat) {
                base = base.filter(p => {
                    const matchesById = p.categoryId === cat.id;
                    const matchesBySlug = p.categoryId === cat.slug;
                    const matchesByParentCategories = p.selectedParentCategoryIds?.includes(cat.id) || false;

                    return matchesById || matchesBySlug || matchesByParentCategories;
                });
            }
        }

        return base;
    }, [products, categories, activeCategory, collections, activeCollection]);

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

    const hasMoreProducts = sortedProducts.length > productsToShow;

    // Función para cargar más productos
    const loadMoreProducts = () => {
        setProductsToShow(prev => prev + 8);
    };

    // Función para alternar dropdown de ordenamiento
    const toggleSortDropdown = () => {
        setSortDropdownOpen(prev => !prev);
    };

    // Función para manejar cambio de ordenamiento
    const handleSortChange = (sortType: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc') => {
        setCurrentSort(sortType);
        setSortDropdownOpen(false);
    };

    // Helper para textos adicionales
    const additionalText = (key: string) => {
        const texts: Record<string, Record<string, string>> = {
            es: {
                'loadMore': 'Cargar más productos',
                'showing': 'Mostrando',
                'of': 'de',
                'products': 'productos',
                'noProductsCategory': 'No hay productos en esta categoría',
                'newest': 'Más reciente',
                'oldest': 'Más antiguo',
                'priceLowHigh': 'Precio: Menor a Mayor',
                'priceHighLow': 'Precio: Mayor a Menor',
                'nameAZ': 'Nombre: A-Z',
                'nameZA': 'Nombre: Z-A'
            },
            en: {
                'loadMore': 'Load more products',
                'showing': 'Showing',
                'of': 'of',
                'products': 'products',
                'noProductsCategory': 'No products in this category',
                'newest': 'Newest',
                'oldest': 'Oldest',
                'priceLowHigh': 'Price: Low to High',
                'priceHighLow': 'Price: High to Low',
                'nameAZ': 'Name: A-Z',
                'nameZA': 'Name: Z-A'
            },
            pt: {
                'loadMore': 'Carregar mais produtos',
                'showing': 'Mostrando',
                'of': 'de',
                'products': 'produtos',
                'noProductsCategory': 'Nenhum produto nesta categoria',
                'newest': 'Mais recente',
                'oldest': 'Mais antigo',
                'priceLowHigh': 'Preço: Menor para Maior',
                'priceHighLow': 'Preço: Maior para Menor',
                'nameAZ': 'Nome: A-Z',
                'nameZA': 'Nome: Z-A'
            }
        };
        return texts[language]?.[key] || texts['es']?.[key] || key;
    };

    // Función para agregar producto al carrito - SIEMPRE abre modal
    const handleAddToCart = async (product: PublicProduct) => {
        // Abrir ProductQuickView para TODOS los productos
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    };

    // Función para construir URLs (no navega, solo para compatibilidad)
    const buildUrl = (path: string) => {
        // En tema restaurant no navegamos, devolvemos #
        return '#';
    };

    // Función para hacer scroll a una categoría específica
    const handleCategoryClick = (categorySlug: string) => {
        // Buscar el carrusel de la categoría por su slug
        const categoryCarousel = document.querySelector(`[data-category-slug="${categorySlug}"]`);
        if (categoryCarousel) {
            // Obtener la posición del elemento
            const elementPosition = categoryCarousel.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 120; // 120px de offset para el header y espacio adicional

            // Hacer scroll suave con offset
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Función para hacer scroll a una colección específica
    const handleCollectionClick = (collectionSlug: string) => {
        // Buscar el carrusel de la colección por su slug
        const collectionCarousel = document.querySelector(`[data-collection-slug="${collectionSlug}"]`);
        if (collectionCarousel) {
            // Obtener la posición del elemento
            const elementPosition = collectionCarousel.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 120; // 120px de offset para el header y espacio adicional

            // Hacer scroll suave con offset
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                {/* Header skeleton */}
                <div className="border-b border-gray-100 p-4">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="flex gap-4">
                            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Products skeleton */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                                <div className="bg-gray-200 rounded aspect-square mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div data-theme="restaurant" className={`nbd-theme ${getTextureClass()}`}>
            {/* Announcement Bar */}
            <AnnouncementBar storeInfo={storeInfo} />

            <Header
                storeInfo={storeInfo}
                categories={categories}
                storeSubdomain={storeSubdomain}
                products={products || []}
                onProductClick={handleAddToCart}
                onCategoryClick={handleCategoryClick}
            />

            {/* Hero Section - Mismo que tema base */}
            {storeInfo?.sections?.hero?.enabled !== false && (
                <HeroSection
                    storeName={storeInfo?.storeName || storeSubdomain}
                    slogan={storeInfo?.slogan}
                    description={storeInfo?.description}
                    heroMediaUrl={storeInfo?.heroMediaUrl || storeInfo?.heroImageUrl}
                    heroMediaType={storeInfo?.heroMediaType || (storeInfo?.heroImageUrl ? 'image' : null)}
                    texts={{
                        exploreProducts: t('exploreProducts'),
                        viewCategories: t('viewCategories'),
                        viewCollections: t('viewCollections'),
                        viewBrands: t('viewBrands')
                    }}
                    toCloudinarySquare={toCloudinarySquareWrapper}
                    categoriesCount={categories?.length || 0}
                    collectionsCount={0}
                    brandsCount={0}
                />
            )}

            {/* Carruseles de productos por categoría - SOLO RESTAURANT */}
            <section id="menu" className="nbd-products">
                <div className={`nbd-container ${(activeCategory && activeCategory !== 'todos') || activeCollection || (!categories?.length && !collections?.length) ? 'show-grid' : 'show-carousels'}`}>
                    {/* Si hay filtro activo (categoría o colección), mostrar con grid */}
                    {(activeCategory && activeCategory !== 'todos') || activeCollection ? (
                        <>
                            <ProductSectionHeader
                                isOnCategoryPage={false}
                                isOnCollectionPage={!!activeCollection}
                                isOnBrandPage={false}
                                activeCategory={activeCategory}
                                categories={categories?.map(cat => ({ slug: cat.slug, name: cat.name })) || undefined}
                                t={tWrapper}
                            />

                            {/* Título de la colección si hay colección activa */}
                            {activeCollection && (
                                <div style={{ marginBottom: 'var(--nbd-space-md)', textAlign: 'center' }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: 'var(--nbd-text-color)' }}>
                                        {collections?.find(c => c.slug === activeCollection)?.title || activeCollection}
                                    </h2>
                                </div>
                            )}

                            {/* Botón para ver todos */}
                            <div style={{ marginBottom: 'var(--nbd-space-md)', textAlign: 'center' }}>
                                <button
                                    onClick={() => {
                                        setActiveCategory('todos');
                                        setActiveCollection(null);
                                    }}
                                    className="nbd-btn nbd-btn--secondary"
                                    style={{
                                        padding: '8px 20px',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: '1px solid var(--nbd-border-color)',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ← {tWrapper('viewAllProducts') || 'Ver todos los productos'}
                                </button>
                            </div>

                            <ProductsGrid
                                displayedProducts={displayedProducts}
                                filteredProducts={filteredProducts}
                                mobileViewMode={mobileViewMode}
                                loadingCartButton={loadingCartButton}
                                productsToShow={productsToShow}
                                hasMoreProducts={hasMoreProducts}
                                handleAddToCart={handleAddToCart}
                                loadMoreProducts={loadMoreProducts}
                                onProductClick={handleAddToCart}
                                buildUrl={buildUrl}
                                toCloudinarySquare={toCloudinarySquareWrapper}
                                formatPrice={formatPrice}
                                additionalText={additionalText}
                                storeInfo={storeInfo || undefined}
                                storeId={resolvedStoreId}
                            />
                        </>
                    ) : (
                        /* Carruseles por categoría y colección */
                        <>
                            {/* Carruseles de colecciones primero */}
                            {collections && collections.length > 0 && (
                                collections.map(collection => (
                                    <RestaurantCollectionCarousel
                                        key={collection.id}
                                        collection={collection}
                                        products={products || []}
                                        onProductClick={handleAddToCart}
                                        onViewAll={(slug) => {
                                            setActiveCollection(slug);
                                            setActiveCategory('todos'); // Resetear categoría
                                            // Scroll a la sección de productos
                                            setTimeout(() => {
                                                const productsSection = document.querySelector('#menu');
                                                if (productsSection) {
                                                    productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }
                                            }, 100);
                                        }}
                                        formatPrice={formatPrice}
                                        toCloudinarySquare={toCloudinarySquareWrapper}
                                        storeInfo={storeInfo}
                                        storeId={resolvedStoreId}
                                        maxProducts={6}
                                    />
                                ))
                            )}

                            {/* Carrusel de imágenes publicitarias - SimpleCarousel */}
                            {storeInfo?.carouselImages && storeInfo.carouselImages.length > 0 &&
                             (storeInfo?.sections?.carousel?.enabled !== false) && (
                                <SimpleCarousel images={storeInfo.carouselImages} />
                            )}

                            {/* Carruseles de categorías después */}
                            {categories && categories.length > 0 ? (
                                categories.map(category => (
                                    <RestaurantCategoryCarousel
                                        key={category.id}
                                        category={category}
                                        products={products || []}
                                        onProductClick={handleAddToCart}
                                        onViewAll={(slug) => {
                                            setActiveCategory(slug);
                                            setActiveCollection(null); // Resetear colección
                                            // Scroll a la sección de productos
                                            setTimeout(() => {
                                                const productsSection = document.querySelector('#menu');
                                                if (productsSection) {
                                                    productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }
                                            }, 100);
                                        }}
                                        formatPrice={formatPrice}
                                        toCloudinarySquare={toCloudinarySquareWrapper}
                                        storeInfo={storeInfo}
                                        storeId={resolvedStoreId}
                                        maxProducts={6}
                                    />
                                ))
                            ) : (
                                /* Si no hay categorías ni colecciones, mostrar grid de productos */
                                !collections?.length && products && products.length > 0 && (
                                    <>
                                        <ProductSectionHeader
                                            isOnCategoryPage={false}
                                            isOnCollectionPage={false}
                                            isOnBrandPage={false}
                                            activeCategory={null}
                                            t={tWrapper}
                                        />
                                        <ProductFilters
                                            filtersModalOpen={false}
                                            sortDropdownOpen={sortDropdownOpen}
                                            currentSort={currentSort}
                                            mobileViewMode={mobileViewMode}
                                            selectedFilters={{}}
                                            filters={[]}
                                            toggleFiltersModal={() => {}}
                                            toggleSortDropdown={toggleSortDropdown}
                                            handleSortChange={handleSortChange}
                                            handleFilterChange={() => {}}
                                            clearAllFilters={() => {}}
                                            setMobileViewMode={setMobileViewMode}
                                            getActiveFiltersCount={() => 0}
                                            t={tWrapper}
                                            additionalText={additionalText}
                                            showFiltersButton={false}
                                        />
                                        <ProductsGrid
                                            displayedProducts={displayedProducts}
                                            filteredProducts={sortedProducts}
                                            mobileViewMode={mobileViewMode}
                                            loadingCartButton={loadingCartButton}
                                            productsToShow={productsToShow}
                                            hasMoreProducts={hasMoreProducts}
                                            handleAddToCart={handleAddToCart}
                                            loadMoreProducts={loadMoreProducts}
                                            onProductClick={handleAddToCart}
                                            buildUrl={buildUrl}
                                            toCloudinarySquare={toCloudinarySquareWrapper}
                                            formatPrice={formatPrice}
                                            additionalText={additionalText}
                                            storeInfo={storeInfo || undefined}
                                            storeId={resolvedStoreId}
                                        />
                                    </>
                                )
                            )}
                        </>
                    )}
                </div>
            </section>

            <Footer
                storeInfo={storeInfo}
                categories={categories}
                storeSubdomain={storeSubdomain}
                storeId={storeId || undefined}
            />

            {/* Modal del carrito */}
            <CartModal storeInfo={storeInfo} storeId={resolvedStoreId || undefined} />

            {/* Modal de vista rápida de producto */}
            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    isOpen={isQuickViewOpen}
                    onClose={() => {
                        setIsQuickViewOpen(false);
                        setQuickViewProduct(null);
                    }}
                    storeInfo={storeInfo || undefined}
                    storeId={resolvedStoreId}
                />
            )}
        </div>
    );
}
