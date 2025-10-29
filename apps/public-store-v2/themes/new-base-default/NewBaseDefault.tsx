"use client";

import { useEffect, useState, useMemo, startTransition, useRef, lazy, Suspense } from "react";
import "./new-base-default.css";
import "./loading-spinner.css";
import "./texture-backgrounds.css";
import "./utilities.css";
import "./collection-carousel.css";
import UnifiedLoading from "../../components/UnifiedLoading";
// 🚀 OPTIMIZACIÓN FASE 2: applyStoreColors se importa dinámicamente para code splitting
import { getStoreBackgroundTexture, StoreBasicInfo } from "../../lib/store";
import { PublicProduct } from "../../lib/products";
import { getStoreCategories, getStoreParentCategories, getCategorySubcategories, Category } from "../../lib/categories";
import { NewBaseDefaultHero } from "./components/NewBaseDefaultHero";
import { AddToCartButton } from "../../components/shared";
import { NewBaseDefaultCategories } from "./components/NewBaseDefaultCategories";
import { NewBaseDefaultProductFilters } from "./components/NewBaseDefaultProductFilters";
import { NewBaseDefaultProductsGrid } from "./components/NewBaseDefaultProductsGrid";
import { NewBaseDefaultSimpleCarousel } from "./components/NewBaseDefaultSimpleCarousel";
import { NewBaseDefaultPageHeaders } from "./components/NewBaseDefaultPageHeaders";
import { NewBaseDefaultSubcategoriesSection } from "./components/NewBaseDefaultSubcategoriesSection";
import { NewBaseDefaultProductSectionHeader } from "./components/NewBaseDefaultProductSectionHeader";
import { PublicBrand, getBrandBySlug } from "../../lib/brands";
import { Filter } from "../../lib/filters";
import { PublicCollection, getCollectionBySlug } from "../../lib/collections";
import { toCloudinarySquare } from "../../lib/images";
import { formatPrice } from "../../lib/currency";
import { useCart } from "../../lib/cart-context";
import { useStoreLanguage } from "../../lib/store-language-context";
// 🚀 OPTIMIZACIÓN FASE 4: React Query hooks para cache automático
import { useAllStoreData } from "../../hooks/useStoreData";
// 🚀 OPTIMIZACIÓN FASE 5: Prefetch inteligente
import { usePrefetch } from "../../hooks/usePrefetch";
import Header from "./Header";
import Footer from "./Footer";
import CartModal from "./CartModal";
import AnnouncementBar from "./AnnouncementBar";

// 🚀 OPTIMIZACIÓN FASE 3: Lazy loading de componentes no críticos
// Estos componentes se cargan bajo demanda para reducir el bundle inicial
const NewBaseDefaultNewsletter = lazy(() => import("./components/NewBaseDefaultNewsletter").then(m => ({ default: m.NewBaseDefaultNewsletter })));
const NewBaseDefaultBrands = lazy(() => import("./components/NewBaseDefaultBrands").then(m => ({ default: m.NewBaseDefaultBrands })));
const CollectionsMosaic = lazy(() => import("../../components/CollectionsMosaic"));
const ProductQuickView = lazy(() => import("./components/ProductQuickView"));
const CollectionProductsCarousel = lazy(() => import("./components/CollectionProductsCarousel").then(m => ({ default: m.CollectionProductsCarousel })));

type Props = {
    storeSubdomain: string;
    categorySlug?: string;
    collectionSlug?: string;
    brandSlug?: string;
    effectiveLocale: string;
    storeId?: string | null;
};

export default function NewBaseDefault({ storeSubdomain, categorySlug, collectionSlug, brandSlug, effectiveLocale, storeId }: Props) {
    const { t, language } = useStoreLanguage();
    const { addItem, openCart, state: cartState } = useCart();
    
    // Textos adicionales que faltan - Helper rápido
    const additionalText = (key: string) => {
        const texts: Record<string, Record<string, string>> = {
            es: {
                'newsletterTitle': 'Mantente al día con nuestras ofertas',
                'newsletterDescription': 'Suscríbete a nuestro newsletter y recibe las últimas novedades, ofertas exclusivas y descuentos especiales directamente en tu correo.',
                'emailPlaceholder': 'tu@email.com',
                'subscribed': '¡Suscrito!',
                'privacyNotice': 'Al suscribirte, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.',
                'loadMore': 'Cargar más productos',
                'showing': 'Mostrando',
                'of': 'de',
                'products': 'productos',
                'product': 'producto',
                'offer': 'Oferta',
                'ourBrands': 'Nuestras marcas',
                'brandSubtitle': 'Trabajamos con las mejores marcas para ofrecerte calidad garantizada',
                'noImage': 'Sin imagen',
                'clearFilters': 'Limpiar filtros',
                'apply': 'Aplicar',
                'noFiltersAvailable': 'No hay filtros disponibles',
                'filtersConfigured': 'Los filtros se configuran desde el panel de administración.',
                'noProductsCategory': 'No hay productos en esta categoría',
                'exploreOther': 'Explora otras categorías o vuelve más tarde',
                'newest': 'Más recientes',
                'oldest': 'Más antiguos',
                'priceLowHigh': 'Precio: menor a mayor',
                'priceHighLow': 'Precio: mayor a menor',
                'nameAZ': 'Nombre: A-Z',
                'nameZA': 'Nombre: Z-A',
                'ourCollections': 'Nuestras Colecciones',
                'collectionsSubtitle': 'Descubre nuestras colecciones cuidadosamente seleccionadas'
            },
            en: {
                'newsletterTitle': 'Stay updated with our offers',
                'newsletterDescription': 'Subscribe to our newsletter and receive the latest news, exclusive offers and special discounts directly in your email.',
                'emailPlaceholder': 'your@email.com',
                'subscribed': 'Subscribed!',
                'privacyNotice': 'By subscribing, you agree to receive promotional emails. You can unsubscribe at any time.',
                'loadMore': 'Load more products',
                'showing': 'Showing',
                'of': 'of',
                'products': 'products',
                'product': 'product',
                'offer': 'Offer',
                'ourBrands': 'Our brands',
                'brandSubtitle': 'We work with the best brands to offer you guaranteed quality',
                'noImage': 'No image',
                'clearFilters': 'Clear filters',
                'apply': 'Apply',
                'noFiltersAvailable': 'No filters available',
                'filtersConfigured': 'Filters are configured from the admin panel.',
                'noProductsCategory': 'No products in this category',
                'exploreOther': 'Explore other categories or come back later',
                'newest': 'Most recent',
                'oldest': 'Oldest',
                'priceLowHigh': 'Price: low to high',
                'priceHighLow': 'Price: high to low',
                'nameAZ': 'Name: A-Z',
                'nameZA': 'Name: Z-A',
                'ourCollections': 'Our Collections',
                'collectionsSubtitle': 'Discover our carefully curated collections'
            },
            pt: {
                'newsletterTitle': 'Mantenha-se atualizado com nossas ofertas',
                'newsletterDescription': 'Subscreva a nossa newsletter e receba as últimas novidades, ofertas exclusivas e descontos especiais diretamente no seu email.',
                'emailPlaceholder': 'seu@email.com',
                'subscribed': 'Subscrito!',
                'privacyNotice': 'Ao subscrever, aceita receber emails promocionais. Pode cancelar a subscrição a qualquer momento.',
                'loadMore': 'Carregar mais produtos',
                'showing': 'Mostrando',
                'of': 'de',
                'products': 'produtos',
                'product': 'produto',
                'offer': 'Oferta',
                'ourBrands': 'Nossas marcas',
                'brandSubtitle': 'Trabalhamos com as melhores marcas para oferecer qualidade garantida',
                'noImage': 'Sem imagem',
                'clearFilters': 'Limpar filtros',
                'apply': 'Aplicar',
                'noFiltersAvailable': 'Nenhum filtro disponível',
                'filtersConfigured': 'Os filtros são configurados no painel de administração.',
                'noProductsCategory': 'Nenhum produto nesta categoria',
                'exploreOther': 'Explore outras categorias ou volte mais tarde',
                'newest': 'Mais recentes',
                'oldest': 'Mais antigos',
                'priceLowHigh': 'Preço: menor a maior',
                'priceHighLow': 'Preço: maior a menor',
                'nameAZ': 'Nome: A-Z',
                'nameZA': 'Nome: Z-A',
                'ourCollections': 'Nossas Coleções',
                'collectionsSubtitle': 'Descubra nossas coleções cuidadosamente selecionadas'
            }
        };
        return texts[language]?.[key] || texts['es']?.[key] || key;
    };
    
    // Función para detectar si estamos en un dominio personalizado
    const isCustomDomain = () => {
        if (typeof window === 'undefined') return false;
        const host = window.location.hostname;
        return !host.endsWith('shopifree.app') && !host.endsWith('localhost') && host !== 'localhost';
    };
    
    // 🚀 NUEVA FUNCIÓN: Construir URLs sin prefijo de idioma (single locale mode)
    const buildUrl = (path: string) => {
        if (typeof window === 'undefined') return path;
        
        const isCustom = isCustomDomain();
        const currentHostname = window.location.hostname;
        
        if (isCustom) {
            // En dominio personalizado: URL directa sin subdominio ni locale
            return path.startsWith('/') ? path : `/${path}`;
        } else {
            // En dominio de plataforma: verificar si ya estamos en el subdominio correcto
            const expectedSubdomain = `${storeSubdomain}.shopifree.app`;
            
            if (currentHostname === expectedSubdomain) {
                // Ya estamos en el subdominio correcto, no agregar el subdominio al path
                return path.startsWith('/') ? path : `/${path}`;
            } else {
                // Estamos en un contexto diferente, incluir el subdominio
                return `/${storeSubdomain}${path.startsWith('/') ? path : `/${path}`}`;
            }
        }
    };
    
    // Detectar si estamos en una página de categoría, colección o marca
    const isOnCategoryPage = !!categorySlug || (typeof window !== 'undefined' && window.location.pathname.includes('/categoria/'));
    const isOnCollectionPage = !!collectionSlug || (typeof window !== 'undefined' && window.location.pathname.includes('/coleccion/'));
    const isOnBrandPage = !!brandSlug || (typeof window !== 'undefined' && window.location.pathname.includes('/marca/'));

    const categorySlugFromUrl = categorySlug || (isOnCategoryPage ? 
        window.location.pathname.split('/categoria/')[1]?.split('/')[0] : null);
    const collectionSlugFromUrl = collectionSlug || (isOnCollectionPage ? 
        window.location.pathname.split('/coleccion/')[1]?.split('/')[0] : null);
    const brandSlugFromUrl = brandSlug || (isOnBrandPage ? 
        window.location.pathname.split('/marca/')[1]?.split('/')[0] : null);
    


    // 🚀 OPTIMIZACIÓN FASE 4: Usar React Query para obtener todos los datos con cache automático
    const {
        storeId: storeIdFromHook,
        storeInfo: storeInfoFromHook,
        products: productsFromHook,
        categories: categoriesFromHook,
        brands: brandsFromHook,
        filters: filtersFromHook,
        collections: collectionsFromHook,
        isLoading: loadingFromHook,
        error: errorFromHook,
    } = useAllStoreData(storeSubdomain);

    // 🚀 OPTIMIZACIÓN FASE 5: Hook de prefetch inteligente
    const { prefetchCategoryProducts, prefetchBrandProducts, prefetchCollectionProducts, prefetchHomePage } = usePrefetch(storeIdFromHook);

    // Usar datos del hook o del prop
    const resolvedStoreId = storeId || storeIdFromHook;
    const loading = loadingFromHook;
    const products = productsFromHook;
    const storeInfo = storeInfoFromHook;
    const categories = categoriesFromHook;
    const brands = brandsFromHook;
    const collections = collectionsFromHook;
    const [currentCollection, setCurrentCollection] = useState<PublicCollection | null>(null);
    const [currentBrand, setCurrentBrand] = useState<PublicBrand | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(categorySlugFromUrl);
    const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
    const [mobileViewMode, setMobileViewMode] = useState<'expanded' | 'grid' | 'list'>('grid');
    const [productsToShow, setProductsToShow] = useState<number>(8); // Mostrar 8 productos inicialmente
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [currentSort, setCurrentSort] = useState<'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc'>('newest');
    const [isMobile, setIsMobile] = useState(false);
    const filters = filtersFromHook; // Ya no necesitamos useState, viene del hook
    const [loadingCartButton, setLoadingCartButton] = useState<string | null>(null); // ID del producto que está siendo agregado
    const [filtersModalOpen, setFiltersModalOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [backgroundTexture, setBackgroundTexture] = useState<string>('default');
    const [loadingSubcategories, setLoadingSubcategories] = useState<boolean>(false);
    
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
        }
    };

    // Determinar la clase de textura
    const getTextureClass = () => {
        if (backgroundTexture === 'default') return '';
        return `texture-${backgroundTexture}`;
    };

    // 🚀 OPTIMIZACIÓN FASE 2: Importación dinámica de colores para reducir bundle inicial
    // Aplicar colores dinámicos de la tienda
    useEffect(() => {
        if (!storeInfo?.primaryColor) return;

        // Importar dinámicamente la función de colores (code splitting)
        import('../../lib/store-colors').then(({ applyStoreColors }) => {
            // Aplicar inmediatamente
            applyStoreColors(storeInfo.primaryColor!, storeInfo.secondaryColor);

            // También aplicar después de un pequeño delay para asegurar que el DOM esté listo
            setTimeout(() => {
                applyStoreColors(storeInfo.primaryColor!, storeInfo.secondaryColor);
            }, 100);

            // Aplicar después de 500ms por si hay componentes lazy loading
            setTimeout(() => {
                applyStoreColors(storeInfo.primaryColor!, storeInfo.secondaryColor);
            }, 500);
        }).catch((error) => {
            console.error('Error loading store colors:', error);
        });
    }, [storeInfo?.primaryColor, storeInfo?.secondaryColor, loading]);

    // Manejar espaciado cuando no hay hero visible
    useEffect(() => {
        const heroVisible = !isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage &&
                           (storeInfo?.sections?.hero?.enabled !== false);

        if (typeof document !== 'undefined') {
            if (heroVisible) {
                document.body.classList.remove('no-hero');
            } else {
                document.body.classList.add('no-hero');
            }
        }
    }, [storeInfo?.sections?.hero?.enabled, isOnCategoryPage, isOnCollectionPage, isOnBrandPage]);

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

    // Resetear botón cuando se cierre el carrito (solo cuando se cierra, no cuando se abre)
    useEffect(() => {
        if (!cartState.isOpen && loadingCartButton) {
            // Agregar una pequeña demora antes de resetear para que el usuario vea el efecto completo
            const timeout = setTimeout(() => {
                setLoadingCartButton(null);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [cartState.isOpen, loadingCartButton]);

    // 🚀 OPTIMIZACIÓN FASE 4: Ya no necesitamos este useEffect
    // Los datos ahora se cargan con React Query en el hook useAllStoreData
    // Esto proporciona cache automático y navegación instantánea

    // Asegurar que activeCategory se setee correctamente al recibir categorySlug prop
    useEffect(() => {
        if (categorySlug) {
            setActiveCategory(categorySlug);
        }
    }, [categorySlug]);

    // Cargar colección actual si estamos en una página de colección
    useEffect(() => {
        if (collectionSlugFromUrl && resolvedStoreId) {
            let alive = true;
            (async () => {
                try {
                    const collection = await getCollectionBySlug(resolvedStoreId, collectionSlugFromUrl);
                    if (!alive) return;
                    setCurrentCollection(collection);
                } catch (error) {
                    console.error('Error loading collection:', error);
                    if (alive) setCurrentCollection(null);
                }
            })();
            return () => {
                alive = false;
            };
        } else if (!collectionSlugFromUrl) {
            setCurrentCollection(null);
        }
    }, [collectionSlugFromUrl, resolvedStoreId]);

    // Cargar marca actual si estamos en una página de marca
    useEffect(() => {
        if (brandSlugFromUrl && resolvedStoreId) {
            let alive = true;
            (async () => {
                try {
                    const brand = await getBrandBySlug(resolvedStoreId, brandSlugFromUrl);
                    if (!alive) return;
                    setCurrentBrand(brand);
                } catch (error) {
                    console.error('Error loading brand:', error);
                    if (alive) setCurrentBrand(null);
                }
            })();
            return () => {
                alive = false;
            };
        } else if (!brandSlugFromUrl) {
            setCurrentBrand(null);
        }
    }, [brandSlugFromUrl, resolvedStoreId]);

    // 🚀 OPTIMIZACIÓN FASE 4: Ya no necesitamos cargar subcategorías manualmente
    // React Query las trae todas en la query inicial de getStoreCategories

    // Resetear paginación cuando cambie la categoría activa
    useEffect(() => {
        setProductsToShow(8);
    }, [activeCategory]);

    // Detectar si estamos en móvil para el carrusel de marcas
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        // Verificar al cargar
        checkIsMobile();
        
        // Escuchar cambios de tamaño
        window.addEventListener('resize', checkIsMobile);
        
        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);

    // Inicializar posición de scroll en el medio para efecto infinito en móvil
    useEffect(() => {
        if (isMobile && brands && brands.length > 0) {
            // Esperar a que el DOM se actualice
            setTimeout(() => {
                const container = document.querySelector('.nbd-brands-container') as HTMLElement;
                if (container) {
                    // Posicionar en el centro del segundo conjunto de marcas
                    // Esto da máximo espacio antes de necesitar saltar
                    const maxScroll = container.scrollWidth - container.clientWidth;
                    const singleSetWidth = maxScroll / 3; // 4 copias = 3 intervalos
                    container.scrollLeft = singleSetWidth * 1.5; // Centro del segundo conjunto
                }
            }, 100);
        }
    }, [isMobile, brands]);



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

    // 🆕 Obtener subcategorías de la categoría actual
    const currentCategorySubcategories = useMemo(() => {
        
        if (!isOnCategoryPage || !categories || !categorySlugFromUrl) {
            return [];
        }
        
        const currentCategory = categories.find(c => c.slug === categorySlugFromUrl);
        
        if (!currentCategory) {
            return [];
        }
        
        // Encontrar subcategorías que pertenecen a esta categoría padre
            
        
        const subcategories = categories.filter(c => c.parentCategoryId === currentCategory.id);
        
        

        
        return subcategories;
    }, [categories, categorySlugFromUrl, isOnCategoryPage]);

    // Productos filtrados
    const filteredProducts = useMemo(() => {
        const hasProducts = Array.isArray(products) && products.length > 0;
        if (!hasProducts) return [];

        let base = [...products];

        // Filtrar por colección si estamos en una página de colección
        if (isOnCollectionPage && currentCollection) {
            
            const beforeFilter = base.length;
            // Filtrar productos que estén en los productIds de la colección
            base = base.filter(p => currentCollection.productIds.includes(p.id));
            
        }

        // Filtrar por marca si estamos en una página de marca
        if (isOnBrandPage && currentBrand) {
            
            const beforeFilter = base.length;
            
            // Filtrar productos que tengan el ID de marca actual
            base = base.filter(p => {
                // Comparar por selectedBrandId (método principal)
                if (p.selectedBrandId && p.selectedBrandId === currentBrand.id) {
                    return true;
                }
                
                // Fallback: comparar por nombre de marca (por compatibilidad)
                if (p.brand) {
                    const productBrand = p.brand.toLowerCase().trim();
                    const currentBrandName = currentBrand.name.toLowerCase().trim();
                    return productBrand === currentBrandName;
                }
                
                return false;
            });
            
        }
        // Filtrar por categoría si no estamos en una página de colección
        else if (activeCategory && activeCategory !== 'todos') {
            const cat = categories?.find(c => c.slug === activeCategory);
            
            if (cat) {
                const beforeFilter = base.length;
                
                // Si hay una subcategoría seleccionada, filtrar solo por ella
                if (selectedSubcategory) {
                    const subcategory = categories?.find(c => c.slug === selectedSubcategory);
                    
                    if (subcategory) {
                        
                        const filteredBySubcategory = base.filter(p => {
                            const matchesById = p.categoryId === subcategory.id;
                            const matchesBySlug = p.categoryId === subcategory.slug;
                            const matchesByParentCategories = p.selectedParentCategoryIds?.includes(subcategory.id) || false;
                            // 🔧 CORRECCIÓN: Verificar selectedSubcategoryIds
                            const matchesBySubcategories = p.selectedSubcategoryIds?.includes(subcategory.id) || false;
                            
                            
                            return matchesById || matchesBySlug || matchesByParentCategories || matchesBySubcategories;
                        });
                        
                        
                        if (filteredBySubcategory.length > 0) {
                            // Si hay productos específicos de la subcategoría, usar esos
                            base = filteredBySubcategory;
                        } else {
                            // 🔧 CORRECCIÓN: Si no hay productos en la subcategoría, mostrar lista vacía
                            // NO mostrar todos los productos de la tienda
                            base = []; // Lista vacía en lugar de mantener todos los productos
                        }
                    }
                } else {
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
                    
                }
            } else {
            }
        }

        // Aplicar filtros seleccionados
        if (Object.keys(selectedFilters).length > 0) {
            
            base = base.filter(product => {
                const productMatches = Object.entries(selectedFilters).every(([filterKey, selectedValues]) => {
                    if (!selectedValues || selectedValues.length === 0) return true;
                    
                    // 🔧 CORRECCIÓN: Los filtros descriptivos están en 'metadata', no en 'tags'
                    // tags = solo variantes reales, metadata = metadatos descriptivos (color, material, etc.)
                    const productMetadata = product.metadata || {};
                    const productFilterValue = productMetadata[filterKey];
                    
                    
                    // Si el producto no tiene este filtro, no lo incluimos
                    if (!productFilterValue) {
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
                    
                    return matches;
                });
                
                return productMatches;
            });
            
        }

        return base;
    }, [products, categories, activeCategory, selectedFilters, selectedSubcategory, isOnCollectionPage, currentCollection, isOnBrandPage, currentBrand]);

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


    // Funciones para manejar filtros
    const toggleFiltersModal = () => {
        setFiltersModalOpen(!filtersModalOpen);
    };

    const handleFilterChange = (filterKey: string, optionValue: string, checked: boolean) => {
        setSelectedFilters(prev => {
            const current = prev[filterKey] || [];
            
            if (checked) {
                // Agregar la opción si está marcada
                const newFilters = {
                    ...prev,
                    [filterKey]: [...current, optionValue]
                };
                return newFilters;
            } else {
                // Remover la opción si está desmarcada
                const updated = current.filter(val => val !== optionValue);
                if (updated.length === 0) {
                    const { [filterKey]: removed, ...rest } = prev;
                    return rest;
                } else {
                    const newFilters = {
                        ...prev,
                        [filterKey]: updated
                    };
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

    // Función para agregar producto al carrito con modal de opciones
    const handleAddToCart = async (product: PublicProduct, finalPrice?: number) => {
        // Verificar si el producto tiene variantes reales (mismo sistema que SimpleVariantSelector)
        let variantsData = null;
        
        // Buscar variantes en diferentes ubicaciones (igual que SimpleVariantSelector)
        if (product.tags && product.tags.variants) {
            variantsData = product.tags.variants;
        } else if ((product as any).variants) {
            variantsData = (product as any).variants;
        } else if ((product as any).metaFieldValues?.variants) {
            variantsData = (product as any).metaFieldValues.variants;
        }

        let hasVariants = false;
        let variantsCount = 0;

        if (variantsData) {
            try {
                let parsedVariants = [];
                if (typeof variantsData === 'string') {
                    parsedVariants = JSON.parse(variantsData);
                } else if (Array.isArray(variantsData)) {
                    parsedVariants = variantsData;
                }
                
                hasVariants = parsedVariants.length > 0;
                variantsCount = parsedVariants.length;
            } catch (error) {
                console.error('Error parseando variantes:', error);
            }
        }
        

        if (hasVariants) {
            // Producto tiene variantes → abrir modal quickview
            setQuickViewProduct(product);
            setIsQuickViewOpen(true);
            // No agregamos efecto de loading porque se abre el modal inmediatamente
        } else {
            // Producto sin opciones → agregar directamente al carrito
            setLoadingCartButton(product.id);

            // Usar el precio ya calculado desde ProductCard o precio original como fallback
            const priceToUse = finalPrice || product.price;

            addItem({
                id: product.id,
                productId: product.id,
                name: product.name,
                price: priceToUse,
                currency: storeInfo?.currency || 'COP',
                image: product.image || '',
                slug: product.slug || product.id,
                incomplete: false
            }, 1);

            setLoadingCartButton(null);
            openCart();
        }
    };
    
    const hasMoreProducts = sortedProducts.length > productsToShow;
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

                {/* Hero skeleton */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="h-48 bg-gray-200 rounded-lg animate-pulse mb-8"></div>

                    {/* Categories skeleton */}
                    <div className="mb-8">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="bg-gray-200 rounded-lg h-20 animate-pulse"></div>
                            ))}
                        </div>
                    </div>

                    {/* Products skeleton */}
                    <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
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
    
    // Encontrar la categoría actual si estamos en una página de categoría
    const currentCategory = isOnCategoryPage ? 
        categories?.find(c => c.slug === categorySlugFromUrl) : null;
    
    return (
        <div data-theme="new-base-default" className={`nbd-theme ${getTextureClass()}`}>
            {/* Announcement Bar */}
            <AnnouncementBar storeInfo={storeInfo} />

            <Header storeInfo={storeInfo || null} categories={categories} storeSubdomain={storeSubdomain} products={products || []} onHomeHover={prefetchHomePage} />
            
            <NewBaseDefaultPageHeaders
                isOnCategoryPage={isOnCategoryPage}
                isOnCollectionPage={isOnCollectionPage}
                isOnBrandPage={isOnBrandPage}
                currentCategory={currentCategory}
                currentCollection={currentCollection}
                currentBrand={currentBrand}
                buildUrl={buildUrl}
                t={t as (key: string) => string}
            />

            <NewBaseDefaultSubcategoriesSection
                isOnCategoryPage={isOnCategoryPage}
                currentCategory={currentCategory}
                subcategories={currentCategorySubcategories}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
            />

            {/* Hero Section Moderno - Solo en home */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage &&
             (storeInfo?.sections?.hero?.enabled !== false) && (
                <NewBaseDefaultHero
                    storeInfo={storeInfo}
                    storeSubdomain={storeSubdomain}
                    t={t as (key: string) => string}
                    toCloudinarySquare={toCloudinarySquare as (url: string, size: number) => string}
                    categoriesCount={topCategories.length}
                    collectionsCount={collections?.length || 0}
                    brandsCount={brands?.length || 0}
                />
            )}

            {/* Sección de Colecciones - Solo en home */}
            {(() => {
                const isHomePage = !isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage;
                const visibleCollections = collections?.filter(c => c.visible) || [];
                const collectionsEnabled = storeInfo?.sections?.collections?.enabled === true;
                const hasCollections = visibleCollections.length > 0;

                if (!isHomePage || !collectionsEnabled || !hasCollections) {
                    return null;
                }

                // 🎯 NUEVA LÓGICA: Con 1-2 colecciones → mostrar productos en carrusel horizontal
                // Con 3+ colecciones → mostrar mosaico de colecciones (comportamiento actual)
                if (visibleCollections.length <= 2) {
                    return (
                        <div id="colecciones" className="collections-carousel-section-wrapper">
                            <Suspense fallback={<div className="py-8 text-center text-gray-400">Cargando productos...</div>}>
                                {visibleCollections.map((collection) => (
                                    <CollectionProductsCarousel
                                        key={collection.id}
                                        collection={collection}
                                        products={products || []}
                                        loadingCartButton={loadingCartButton}
                                        handleAddToCart={handleAddToCart}
                                        buildUrl={buildUrl}
                                        toCloudinarySquare={(url: string, size: number) => toCloudinarySquare(url, size) || url}
                                        formatPrice={formatPrice}
                                        additionalText={additionalText}
                                        storeInfo={storeInfo || undefined}
                                        storeId={resolvedStoreId}
                                        onOpenQuickView={(product) => {
                                            setQuickViewProduct(product);
                                            setIsQuickViewOpen(true);
                                        }}
                                    />
                                ))}
                            </Suspense>
                        </div>
                    );
                } else {
                    // 3+ colecciones: mostrar mosaico (comportamiento actual)
                    return (
                        <div id="colecciones">
                            <Suspense fallback={<div className="py-8 text-center text-gray-400">Cargando colecciones...</div>}>
                                <CollectionsMosaic
                                    collections={collections}
                                    storeSubdomain={storeSubdomain}
                                    onCollectionHover={prefetchCollectionProducts}
                                />
                            </Suspense>
                        </div>
                    );
                }
            })()}

            {/* Sección de categorías con mosaico inteligente - Solo en home */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage &&
             (storeInfo?.sections?.categories?.enabled !== false) && (
                <NewBaseDefaultCategories
                    categories={categories || []}
                    products={products || []}
                    activeCategory={activeCategory ?? undefined}
                    t={t as (key: string) => string}
                    buildUrl={buildUrl}
                    toCloudinarySquare={toCloudinarySquare as (url: string, size: number) => string}
                    onCategoryHover={prefetchCategoryProducts}
                />
            )}

            {/* Sección de productos */}
            <section id="productos" className="nbd-products">
                <div className="nbd-container">
                    <NewBaseDefaultProductSectionHeader
                        isOnCategoryPage={isOnCategoryPage}
                        isOnCollectionPage={isOnCollectionPage}
                        isOnBrandPage={isOnBrandPage}
                        activeCategory={activeCategory}
                        categories={categories?.map(cat => ({ slug: cat.slug, name: cat.name })) || undefined}
                        t={t as (key: string) => string}
                    />

                    <NewBaseDefaultProductFilters
                        filtersModalOpen={filtersModalOpen}
                        sortDropdownOpen={sortDropdownOpen}
                        currentSort={currentSort}
                        mobileViewMode={mobileViewMode}
                        selectedFilters={selectedFilters}
                        filters={filters}
                        toggleFiltersModal={toggleFiltersModal}
                        toggleSortDropdown={toggleSortDropdown}
                        handleSortChange={handleSortChange}
                        handleFilterChange={handleFilterChange}
                        clearAllFilters={clearAllFilters}
                        setMobileViewMode={setMobileViewMode}
                        getActiveFiltersCount={getActiveFiltersCount}
                        t={t as (key: string) => string}
                        additionalText={additionalText}
                    />

                    <NewBaseDefaultProductsGrid
                        displayedProducts={displayedProducts}
                        filteredProducts={filteredProducts}
                        mobileViewMode={mobileViewMode}
                        loadingCartButton={loadingCartButton}
                        productsToShow={productsToShow}
                        hasMoreProducts={hasMoreProducts}
                        handleAddToCart={handleAddToCart}
                        loadMoreProducts={loadMoreProducts}
                        buildUrl={buildUrl}
                        toCloudinarySquare={(url: string, size: number) => toCloudinarySquare(url, size) || url}
                        formatPrice={formatPrice}
                        additionalText={additionalText}
                        storeInfo={storeInfo || undefined}
                        storeId={resolvedStoreId}
                    />
                </div>
            </section>

            {/* Carrusel Simple */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && storeInfo?.carouselImages && storeInfo.carouselImages.length > 0 &&
             (storeInfo?.sections?.carousel?.enabled !== false) && (
                <NewBaseDefaultSimpleCarousel images={storeInfo.carouselImages} />
            )}

            {/* Sección de Newsletter */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage &&
             (storeInfo?.sections?.newsletter?.enabled === true) && (
                <Suspense fallback={<div className="py-8" />}>
                    <NewBaseDefaultNewsletter additionalText={additionalText} t={t as (key: string) => string} />
                </Suspense>
            )}

            {/* Sección de Marcas Carousel - Solo en home */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && brands && brands.length > 0 &&
             (storeInfo?.sections?.brands?.enabled === true) && (
                <div id="marcas">
                    <Suspense fallback={<div className="py-8 text-center text-gray-400">Cargando marcas...</div>}>
                        <NewBaseDefaultBrands
                            brands={brands}
                            isMobile={isMobile}
                            additionalText={additionalText}
                            buildUrl={buildUrl}
                            toCloudinarySquare={(url: string, size: number) => toCloudinarySquare(url, size) || url}
                            onBrandHover={prefetchBrandProducts}
                        />
                    </Suspense>
                </div>
            )}

            <Footer storeInfo={storeInfo || null} categories={categories} storeSubdomain={storeSubdomain} storeId={storeId || undefined} />

            {/* Modal del carrito */}
            <CartModal storeInfo={storeInfo || null} storeId={resolvedStoreId || undefined} />
            
            {/* Modal de vista rápida de producto */}
            {quickViewProduct && (
                <Suspense fallback={null}>
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
                </Suspense>
            )}
        </div>
    );
}
