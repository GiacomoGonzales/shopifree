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
import { toCloudinarySquare } from "../../lib/images";
import { formatPrice } from "../../lib/currency";
import { useCart } from "../../lib/cart-context";
import { useStoreLanguage } from "../../lib/store-language-context";
import Header from "../new-base-default/Header";
import Footer from "../new-base-default/Footer";
import CartModal from "../new-base-default/CartModal";
import ProductQuickView from "../new-base-default/components/ProductQuickView";
import AnnouncementBar from "../new-base-default/AnnouncementBar";
import { HeroSection, ProductsGrid, CategoriesSection, ProductSectionHeader } from "../../components/shared";
import RestaurantCategoryCarousel from "./components/RestaurantCategoryCarousel";

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
    const [activeCategory, setActiveCategory] = useState<string | null>('todos'); // Categoría activa para filtrar
    const [backgroundTexture, setBackgroundTexture] = useState<string>('default');
    const [mobileViewMode, setMobileViewMode] = useState<'expanded' | 'grid' | 'list'>('grid');
    const [productsToShow, setProductsToShow] = useState<number>(8);
    const [loadingCartButton, setLoadingCartButton] = useState<string | null>(null);

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

    // Cargar datos de la tienda
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const id = await getStoreIdBySubdomain(storeSubdomain);
                if (!alive) return;
                setStoreIdState(id);
                if (id) {
                    const [items, info, cats] = await Promise.all([
                        getStoreProducts(id),
                        getStoreBasicInfo(id),
                        getStoreParentCategories(id) // Solo categorías padre para filtros
                    ]);
                    if (!alive) return;
                    startTransition(() => {
                        setProducts(items);
                        setCategories(cats);
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

    // Productos filtrados por categoría (solo cuando hay filtro activo - "Ver todos")
    const filteredProducts = useMemo(() => {
        const hasProducts = Array.isArray(products) && products.length > 0;
        if (!hasProducts) return [];

        let base = [...products];

        // Filtrar por categoría activa
        if (activeCategory && activeCategory !== 'todos') {
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
    }, [products, categories, activeCategory]);

    // Productos a mostrar con paginación
    const displayedProducts = useMemo(() => {
        return filteredProducts.slice(0, productsToShow);
    }, [filteredProducts, productsToShow]);

    const hasMoreProducts = filteredProducts.length > productsToShow;

    // Función para cargar más productos
    const loadMoreProducts = () => {
        setProductsToShow(prev => prev + 8);
    };

    // Helper para textos adicionales
    const additionalText = (key: string) => {
        const texts: Record<string, Record<string, string>> = {
            es: {
                'loadMore': 'Cargar más productos',
                'showing': 'Mostrando',
                'of': 'de',
                'products': 'productos',
                'noProductsCategory': 'No hay productos en esta categoría'
            },
            en: {
                'loadMore': 'Load more products',
                'showing': 'Showing',
                'of': 'of',
                'products': 'products',
                'noProductsCategory': 'No products in this category'
            },
            pt: {
                'loadMore': 'Carregar mais produtos',
                'showing': 'Mostrando',
                'of': 'de',
                'products': 'produtos',
                'noProductsCategory': 'Nenhum produto nesta categoria'
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

    // Interceptar clicks en productos del grid (cuando hay filtro activo) para abrir modal
    useEffect(() => {
        // Solo si hay categoría activa (modo grid)
        if (!activeCategory || activeCategory === 'todos') return;

        const handleProductClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const productCard = target.closest('.nbd-product-card') as HTMLElement;

            if (productCard && !target.closest('.nbd-add-to-cart-btn')) {
                e.preventDefault();
                e.stopPropagation();

                // Buscar el producto por el índice del card
                const cards = Array.from(document.querySelectorAll('.nbd-product-card'));
                const index = cards.indexOf(productCard);

                if (index !== -1 && displayedProducts[index]) {
                    setQuickViewProduct(displayedProducts[index]);
                    setIsQuickViewOpen(true);
                }
            }
        };

        // Agregar listener al contenedor de productos
        const productsGrid = document.querySelector('.nbd-products-grid');
        if (productsGrid) {
            productsGrid.addEventListener('click', handleProductClick as EventListener);
        }

        return () => {
            if (productsGrid) {
                productsGrid.removeEventListener('click', handleProductClick as EventListener);
            }
        };
    }, [displayedProducts, activeCategory]);

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
                <div className="nbd-container">
                    {/* Si hay filtro activo, mostrar solo esa categoría con grid */}
                    {activeCategory && activeCategory !== 'todos' ? (
                        <>
                            <ProductSectionHeader
                                isOnCategoryPage={false}
                                isOnCollectionPage={false}
                                isOnBrandPage={false}
                                activeCategory={activeCategory}
                                categories={categories?.map(cat => ({ slug: cat.slug, name: cat.name })) || undefined}
                                t={tWrapper}
                            />

                            {/* Botón para ver todos */}
                            <div style={{ marginBottom: 'var(--nbd-space-md)', textAlign: 'center' }}>
                                <button
                                    onClick={() => setActiveCategory('todos')}
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
                                buildUrl={buildUrl}
                                toCloudinarySquare={toCloudinarySquareWrapper}
                                formatPrice={formatPrice}
                                additionalText={additionalText}
                                storeInfo={storeInfo || undefined}
                                storeId={resolvedStoreId}
                            />
                        </>
                    ) : (
                        /* Carruseles por categoría */
                        <>
                            {categories && categories.length > 0 ? (
                                categories.map(category => (
                                    <RestaurantCategoryCarousel
                                        key={category.id}
                                        category={category}
                                        products={products || []}
                                        onProductClick={handleAddToCart}
                                        onViewAll={(slug) => {
                                            setActiveCategory(slug);
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
                                        maxProducts={10}
                                    />
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: 'var(--nbd-space-3xl)' }}>
                                    <p style={{ color: 'var(--nbd-text-secondary)' }}>No hay categorías disponibles</p>
                                </div>
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
