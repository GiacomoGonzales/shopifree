"use client";

import { useEffect, useState, useMemo, startTransition, useRef } from "react";
import "./new-base-default.css";
import "./loading-spinner.css";
import "./texture-backgrounds.css";
import "./utilities.css";
import UnifiedLoading from "../../components/UnifiedLoading";
import { getStoreIdBySubdomain, getStoreBasicInfo, StoreBasicInfo, getStoreBackgroundTexture, applyStoreColors } from "../../lib/store";
import { getStoreProducts, PublicProduct } from "../../lib/products";
import { getStoreCategories, getStoreParentCategories, getCategorySubcategories, Category } from "../../lib/categories";
import { NewBaseDefaultNewsletter } from "./components/NewBaseDefaultNewsletter";
import { NewBaseDefaultHero } from "./components/NewBaseDefaultHero";
import { AddToCartButton } from "../../components/shared";
import { NewBaseDefaultCategories } from "./components/NewBaseDefaultCategories";
import { NewBaseDefaultBrands } from "./components/NewBaseDefaultBrands";
import { NewBaseDefaultProductFilters } from "./components/NewBaseDefaultProductFilters";
import { NewBaseDefaultProductsGrid } from "./components/NewBaseDefaultProductsGrid";
import { NewBaseDefaultSimpleCarousel } from "./components/NewBaseDefaultSimpleCarousel";
import { NewBaseDefaultPageHeaders } from "./components/NewBaseDefaultPageHeaders";
import { NewBaseDefaultSubcategoriesSection } from "./components/NewBaseDefaultSubcategoriesSection";
import { NewBaseDefaultProductSectionHeader } from "./components/NewBaseDefaultProductSectionHeader";
import { getStoreBrands, PublicBrand, getBrandBySlug } from "../../lib/brands";
import { getStoreFilters, Filter } from "../../lib/filters";
import { getStoreCollections, PublicCollection, getCollectionBySlug } from "../../lib/collections";
import CollectionsMosaic from "../../components/CollectionsMosaic";
import { toCloudinarySquare } from "../../lib/images";
import { formatPrice } from "../../lib/currency";
import { useCart } from "../../lib/cart-context";
import { useStoreLanguage } from "../../lib/store-language-context";
import Header from "./Header";
import Footer from "./Footer";
import CartModal from "./CartModal";
import ProductQuickView from "./components/ProductQuickView";

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
    


    const [storeIdState, setStoreIdState] = useState<string | null>(null);
    const resolvedStoreId = storeId || storeIdState;
    const [loading, setLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<PublicProduct[] | null>(null);
    const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [brands, setBrands] = useState<PublicBrand[] | null>(null);
    const [collections, setCollections] = useState<PublicCollection[] | null>(null);
    const [currentCollection, setCurrentCollection] = useState<PublicCollection | null>(null);
    const [currentBrand, setCurrentBrand] = useState<PublicBrand | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(categorySlugFromUrl);
    const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
    const [mobileViewMode, setMobileViewMode] = useState<'expanded' | 'grid' | 'list'>('grid');
    const [productsToShow, setProductsToShow] = useState<number>(8); // Mostrar 8 productos inicialmente
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [currentSort, setCurrentSort] = useState<'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc'>('newest');
    const [isMobile, setIsMobile] = useState(false);
    const [filters, setFilters] = useState<Filter[]>([]);
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
            console.log('Using default background texture');
        }
    };

    // Determinar la clase de textura
    const getTextureClass = () => {
        if (backgroundTexture === 'default') return '';
        return `texture-${backgroundTexture}`;
    };

    // Aplicar colores dinámicos de la tienda
    useEffect(() => {
        console.log('🔄 Store color effect running...', {
            storeInfo: storeInfo ? 'loaded' : 'null',
            primaryColor: storeInfo?.primaryColor,
            secondaryColor: storeInfo?.secondaryColor
        });
        
        if (storeInfo?.primaryColor) {
            console.log('✅ Applying store colors...');
            
            // Aplicar inmediatamente
            applyStoreColors(storeInfo.primaryColor, storeInfo.secondaryColor);
            
            // También aplicar después de un pequeño delay para asegurar que el DOM esté listo
            setTimeout(() => {
                console.log('🔄 Re-applying colors after delay...');
                applyStoreColors(storeInfo.primaryColor!, storeInfo.secondaryColor);
            }, 100);
        } else {
            console.log('⚠️ No primary color found in store info');
        }
    }, [storeInfo?.primaryColor, storeInfo?.secondaryColor]);

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

    // Cargar datos de la tienda
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const id = await getStoreIdBySubdomain(storeSubdomain);
                if (!alive) return;
                setStoreIdState(id);
                if (id) {
                    // Usar función optimizada si estamos en home page, función completa si estamos en página de categoría
                    const isOnHomePage = !categorySlug && !collectionSlug && !brandSlug;
                    const categoryLoadFunction = isOnHomePage ? getStoreParentCategories : getStoreCategories;
                    
                    const [items, info, cats, brandList, filterList, collectionsList] = await Promise.all([
                        getStoreProducts(id),
                        getStoreBasicInfo(id),
                        categoryLoadFunction(id),
                        getStoreBrands(id),
                        getStoreFilters(id),
                        getStoreCollections(id)
                    ]);
                    if (!alive) return;
                    // Actualizar todos los estados en una transición para evitar renders intermedios
                    startTransition(() => {
                        setProducts(items);
                        setCategories(cats);
                        setBrands(brandList);
                        setFilters(filterList);
                        setCollections(collectionsList);
                        setStoreInfo(info);
                    });
                    
                    console.log("Categorías cargadas:", cats);
                    console.log("Categorías padre:", cats?.filter(c => !c.parentCategoryId));
                    console.log("🔍 TODAS las categorías con parentCategoryId:");
                    cats?.forEach(c => {
                        console.log(`  - ${c.name} (${c.slug}): ID=${c.id}, parentCategoryId=${c.parentCategoryId || 'NULL'}`);
                    });
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

    // Cargar subcategorías dinámicamente cuando se accede a una página de categoría
    useEffect(() => {
        if (isOnCategoryPage && categorySlugFromUrl && resolvedStoreId && categories) {
            const currentCategory = categories.find(c => c.slug === categorySlugFromUrl);
            if (currentCategory && !categories.some(c => c.parentCategoryId === currentCategory.id)) {
                // Solo cargar si no tenemos subcategorías ya cargadas para esta categoría
                let alive = true;
                setLoadingSubcategories(true);
                
                (async () => {
                    try {
                        const subcategories = await getCategorySubcategories(resolvedStoreId, currentCategory.id);
                        if (!alive) return;
                        
                        if (subcategories.length > 0) {
                            // Agregar las subcategorías al estado de categorías
                            setCategories(prev => {
                                if (!prev) return prev;
                                // Verificar que no estén ya agregadas
                                const existingSubcategoryIds = prev.filter(c => c.parentCategoryId === currentCategory.id).map(c => c.id);
                                const newSubcategories = subcategories.filter(sub => !existingSubcategoryIds.includes(sub.id));
                                return [...prev, ...newSubcategories];
                            });
                        }
                    } catch (error) {
                        console.error('Error loading subcategories:', error);
                    } finally {
                        if (alive) setLoadingSubcategories(false);
                    }
                })();
                
                return () => {
                    alive = false;
                };
            }
        }
    }, [isOnCategoryPage, categorySlugFromUrl, resolvedStoreId, categories]);

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
        console.log('🔍 Debugging subcategories detection:', {
            isOnCategoryPage,
            hasCategories: !!categories,
            categorySlugFromUrl,
            categoriesLength: categories?.length || 0
        });
        
        if (!isOnCategoryPage || !categories || !categorySlugFromUrl) {
            console.log('❌ Early return: missing requirements for subcategories');
            return [];
        }
        
        const currentCategory = categories.find(c => c.slug === categorySlugFromUrl);
        console.log('🔍 Current category found:', currentCategory);
        
        if (!currentCategory) {
            console.log('❌ No current category found with slug:', categorySlugFromUrl);
            console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
            return [];
        }
        
        // Encontrar subcategorías que pertenecen a esta categoría padre
        console.log(`🔍 Looking for subcategories with parentCategoryId: "${currentCategory.id}"`);
        console.log('🔍 All categories with their parentCategoryId:', 
            categories.map(c => ({ 
                id: c.id, 
                name: c.name, 
                slug: c.slug, 
                parentCategoryId: c.parentCategoryId || 'null' 
            })));
            
        console.log('🔍 Exact ID comparison:');
        console.log('Current category ID:', JSON.stringify(currentCategory.id));
        categories.forEach(c => {
            if (c.parentCategoryId) {
                console.log(`Category "${c.name}" has parentCategoryId:`, JSON.stringify(c.parentCategoryId));
                console.log(`Does it match? ${c.parentCategoryId === currentCategory.id}`);
            }
        });
        
        const subcategories = categories.filter(c => c.parentCategoryId === currentCategory.id);
        
        console.log(`🔍 Subcategorías encontradas para "${currentCategory.name}" (ID: ${currentCategory.id}):`, 
            subcategories.map(s => ({ id: s.id, name: s.name, slug: s.slug, parentCategoryId: s.parentCategoryId })));
        

        
        return subcategories;
    }, [categories, categorySlugFromUrl, isOnCategoryPage]);

    // Productos filtrados
    const filteredProducts = useMemo(() => {
        const hasProducts = Array.isArray(products) && products.length > 0;
        if (!hasProducts) return [];

        let base = [...products];

        // Filtrar por colección si estamos en una página de colección
        if (isOnCollectionPage && currentCollection) {
            console.log("=== COLLECTION FILTERING DEBUG ===");
            console.log("collectionSlug prop:", collectionSlug);
            console.log("isOnCollectionPage:", isOnCollectionPage);
            console.log("Colección encontrada:", currentCollection);
            console.log("IDs de productos en colección:", currentCollection.productIds);
            console.log("Todos los productos:", base.map(p => ({id: p.id, name: p.name})));
            
            const beforeFilter = base.length;
            // Filtrar productos que estén en los productIds de la colección
            base = base.filter(p => currentCollection.productIds.includes(p.id));
            
            console.log(`Productos antes del filtro: ${beforeFilter}, después: ${base.length}`);
            console.log("Productos filtrados por colección:", base.map(p => ({id: p.id, name: p.name})));
            console.log("=== END COLLECTION FILTERING DEBUG ===");
        }

        // Filtrar por marca si estamos en una página de marca
        if (isOnBrandPage && currentBrand) {
            console.log("=== BRAND FILTERING DEBUG ===");
            console.log("brandSlug prop:", brandSlug);
            console.log("isOnBrandPage:", isOnBrandPage);
            console.log("Marca encontrada:", currentBrand);
            console.log("Todos los productos:", base.map(p => ({
                id: p.id, 
                name: p.name, 
                brand: p.brand, 
                selectedBrandId: p.selectedBrandId
            })));
            
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
            
            console.log(`Productos antes del filtro: ${beforeFilter}, después: ${base.length}`);
            console.log("Productos filtrados por marca:", base.map(p => ({
                id: p.id, 
                name: p.name, 
                brand: p.brand, 
                selectedBrandId: p.selectedBrandId
            })));
            console.log("Comparando selectedBrandId con currentBrand.id:", {
                currentBrandId: currentBrand.id,
                currentBrandName: currentBrand.name,
                currentBrandSlug: currentBrand.slug
            });
            console.log("=== END BRAND FILTERING DEBUG ===");
        }
        // Filtrar por categoría si no estamos en una página de colección
        else if (activeCategory && activeCategory !== 'todos') {
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
                
                // Si hay una subcategoría seleccionada, filtrar solo por ella
                if (selectedSubcategory) {
                    console.log(`🔍 Filtrando por subcategoría: ${selectedSubcategory}`);
                    const subcategory = categories?.find(c => c.slug === selectedSubcategory);
                    console.log('🔍 Subcategoría encontrada:', subcategory);
                    
                    if (subcategory) {
                        console.log('🔍 Productos antes del filtro por subcategoría:', base.length);
                        console.log('🔍 Productos con sus categoryIds:', base.map(p => ({
                            name: p.name,
                            categoryId: p.categoryId,
                            selectedParentCategoryIds: p.selectedParentCategoryIds
                        })));
                        
                        const filteredBySubcategory = base.filter(p => {
                            const matchesById = p.categoryId === subcategory.id;
                            const matchesBySlug = p.categoryId === subcategory.slug;
                            const matchesByParentCategories = p.selectedParentCategoryIds?.includes(subcategory.id) || false;
                            // 🔧 CORRECCIÓN: Verificar selectedSubcategoryIds
                            const matchesBySubcategories = p.selectedSubcategoryIds?.includes(subcategory.id) || false;
                            
                            console.log(`🔍 Producto "${p.name}":`, {
                                categoryId: p.categoryId,
                                selectedParentCategoryIds: p.selectedParentCategoryIds,
                                selectedSubcategoryIds: p.selectedSubcategoryIds,
                                subcategoryId: subcategory.id,
                                matchesById,
                                matchesBySlug,
                                matchesByParentCategories,
                                matchesBySubcategories,
                                finalMatch: matchesById || matchesBySlug || matchesByParentCategories || matchesBySubcategories
                            });
                            
                            return matchesById || matchesBySlug || matchesByParentCategories || matchesBySubcategories;
                        });
                        
                        console.log(`🔍 Productos específicos de subcategoría "${subcategory.name}": ${filteredBySubcategory.length}`);
                        
                        if (filteredBySubcategory.length > 0) {
                            // Si hay productos específicos de la subcategoría, usar esos
                            base = filteredBySubcategory;
                            console.log(`✅ Usando productos específicos de subcategoría`);
                        } else {
                            // 🔧 CORRECCIÓN: Si no hay productos en la subcategoría, mostrar lista vacía
                            // NO mostrar todos los productos de la tienda
                            console.log(`⚠️ No hay productos específicos de "${subcategory.name}", mostrando lista vacía`);
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
                    
                    console.log(`Productos antes del filtro: ${beforeFilter}, después: ${base.length}`);
                    console.log("IDs de categorías a buscar:", allCategoryIds);
                    console.log("Slugs de categorías a buscar:", allCategorySlugs);
                }
            } else {
                console.log("❌ No se encontró la categoría con slug:", activeCategory);
            }
            console.log("=== END CATEGORY FILTERING DEBUG ===");
        }

        // Aplicar filtros seleccionados
        if (Object.keys(selectedFilters).length > 0) {
            console.log("=== APPLYING FILTERS ===");
            console.log("Selected filters:", selectedFilters);
            console.log("First product metadata example:", base[0]?.metadata);
            console.log("First product tags example:", base[0]?.tags);
            
            base = base.filter(product => {
                const productMatches = Object.entries(selectedFilters).every(([filterKey, selectedValues]) => {
                    if (!selectedValues || selectedValues.length === 0) return true;
                    
                    // 🔧 CORRECCIÓN: Los filtros descriptivos están en 'metadata', no en 'tags'
                    // tags = solo variantes reales, metadata = metadatos descriptivos (color, material, etc.)
                    const productMetadata = product.metadata || {};
                    const productFilterValue = productMetadata[filterKey];
                    
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
        
        console.log(`🛒 Product "${product.name}" variants analysis:`, {
            hasVariantsData: !!variantsData,
            variantsCount,
            hasVariants,
            action: hasVariants ? 'OPEN_QUICKVIEW' : 'ADD_DIRECT'
        });

        if (hasVariants) {
            // Producto tiene variantes → abrir modal quickview
            console.log(`Producto con variantes: ${product.name} - Abriendo modal`);
            setQuickViewProduct(product);
            setIsQuickViewOpen(true);
            // No agregamos efecto de loading porque se abre el modal inmediatamente
        } else {
            // Producto sin opciones → agregar directamente al carrito
            console.log(`Producto sin opciones: ${product.name} - Agregando directamente`);
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
            console.log(`Agregado al carrito: ${product.name} con precio ${priceToUse}`);
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
            <Header storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} products={products || []} />
            
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
                />
            )}

            {/* Sección de Colecciones - Solo en home */}
            {(() => {
                console.log('🔍 Collections Debug:', {
                    isOnCategoryPage,
                    isOnCollectionPage,
                    isOnBrandPage,
                    hasCollections: collections && collections.length > 0,
                    sectionsConfig: storeInfo?.sections,
                    collectionsEnabled: storeInfo?.sections?.collections?.enabled,
                    shouldShow: !isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && collections && collections.length > 0 && (storeInfo?.sections?.collections?.enabled === true)
                });

                return (!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && collections && collections.length > 0 &&
                        (storeInfo?.sections?.collections?.enabled === true)) ? (
                    <CollectionsMosaic
                        collections={collections}
                        storeSubdomain={storeSubdomain}
                    />
                ) : null;
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
                <NewBaseDefaultNewsletter additionalText={additionalText} t={t as (key: string) => string} />
            )}

            {/* Sección de Marcas Carousel - Solo en home */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && brands && brands.length > 0 &&
             (storeInfo?.sections?.brands?.enabled === true) && (
                <NewBaseDefaultBrands
                    brands={brands}
                    isMobile={isMobile}
                    additionalText={additionalText}
                    buildUrl={buildUrl}
                    toCloudinarySquare={(url: string, size: number) => toCloudinarySquare(url, size) || url}
                />
            )}

            <Footer storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} storeId={storeId || undefined} />
            
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
