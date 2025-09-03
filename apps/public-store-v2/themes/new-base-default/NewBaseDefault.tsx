"use client";

import { useEffect, useState, useMemo, startTransition, useRef } from "react";
import "./new-base-default.css";
import "./loading-spinner.css";
import "./texture-backgrounds.css";
import UnifiedLoading from "../../components/UnifiedLoading";
import { getStoreIdBySubdomain, getStoreBasicInfo, StoreBasicInfo, getStoreBackgroundTexture, applyStoreColors } from "../../lib/store";
import { getStoreProducts, PublicProduct } from "../../lib/products";
import { getStoreCategories, Category } from "../../lib/categories";
import { getStoreBrands, PublicBrand } from "../../lib/brands";
import { getStoreFilters, Filter } from "../../lib/filters";
import { getStoreCollections, PublicCollection, getCollectionBySlug } from "../../lib/collections";
import { getBrandBySlug } from "../../lib/brands";
import CollectionsMosaic from "../../components/CollectionsMosaic";
import { toCloudinarySquare } from "../../lib/images";
import { formatPrice } from "../../lib/currency";
import { useCart } from "../../lib/cart-context";
import { useStoreLanguage } from "../../lib/store-language-context";
import Header from "./Header";
import Footer from "./Footer";
import CartModal from "./CartModal";

type Props = {
    storeSubdomain: string;
    categorySlug?: string;
    collectionSlug?: string;
    brandSlug?: string;
    effectiveLocale: string;
    storeId?: string | null;
};

export default function NewBaseDefault({ storeSubdomain, categorySlug, collectionSlug, brandSlug, effectiveLocale, storeId }: Props) {
    // 🌐 Usar textos dinámicos según el idioma configurado en la tienda
    const { t, language } = useStoreLanguage();
    const { addItem, openCart, state: cartState } = useCart();
    
    // 🎥 Ref for hero video autoplay
    const heroVideoRef = useRef<HTMLVideoElement>(null);
    
    // 🆕 Textos adicionales que faltan - Helper rápido
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
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isJumpingRef = useRef(false);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [loadingCartButton, setLoadingCartButton] = useState<string | null>(null); // ID del producto que está siendo agregado
    const [filtersModalOpen, setFiltersModalOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [backgroundTexture, setBackgroundTexture] = useState<string>('default');
    
    // Estados para el carrusel
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
                    const [items, info, cats, brandList, filterList, collectionsList] = await Promise.all([
                        getStoreProducts(id),
                        getStoreBasicInfo(id),
                        getStoreCategories(id),
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

    // 🎥 Force hero video autoplay
    useEffect(() => {
        if (heroVideoRef.current && storeInfo?.heroMediaType === 'video') {
            const video = heroVideoRef.current;
            
            // Try to play the video
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        // Autoplay started successfully
                        console.log('Hero video autoplay started successfully');
                    })
                    .catch((error) => {
                        // Autoplay was prevented
                        console.log('Hero video autoplay prevented:', error);
                        // Try to play on user interaction
                        const playOnInteraction = () => {
                            video.play();
                            document.removeEventListener('click', playOnInteraction);
                            document.removeEventListener('touchstart', playOnInteraction);
                        };
                        document.addEventListener('click', playOnInteraction);
                        document.addEventListener('touchstart', playOnInteraction);
                    });
            }
        }
    }, [storeInfo?.heroMediaType, storeInfo?.heroMediaUrl]);

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
                            // Si no hay productos específicos, mostrar productos de la categoría padre
                            // que podrían pertenecer a esta subcategoría (fallback inteligente)
                            console.log(`⚠️ No hay productos específicos de "${subcategory.name}", mostrando productos de categoría padre`);
                            // Mantener todos los productos de la categoría padre
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

    // Carrusel - Autoplay automático
    useEffect(() => {
        if (!isAutoplay || !storeInfo?.carouselImages?.length) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => 
                prev + 1 >= (storeInfo.carouselImages?.length || 0) ? 0 : prev + 1
            );
        }, 4000); // Cambiar cada 4 segundos

        return () => clearInterval(interval);
    }, [isAutoplay, storeInfo?.carouselImages?.length]);

    // Funciones del carrusel
    const nextSlide = () => {
        setIsAutoplay(false); // Pausar autoplay cuando el usuario interactúa
        setCurrentSlide(prev => 
            prev + 1 >= (storeInfo?.carouselImages?.length || 0) ? 0 : prev + 1
        );
        // Reactivar autoplay después de 10 segundos
        setTimeout(() => setIsAutoplay(true), 10000);
    };

    const prevSlide = () => {
        setIsAutoplay(false);
        setCurrentSlide(prev => 
            prev - 1 < 0 ? (storeInfo?.carouselImages?.length || 0) - 1 : prev - 1
        );
        setTimeout(() => setIsAutoplay(true), 10000);
    };

    const goToSlide = (index: number) => {
        setIsAutoplay(false);
        setCurrentSlide(index);
        setTimeout(() => setIsAutoplay(true), 10000);
    };

    // Funciones para el touch en móvil
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

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
    const sortOptions = useMemo(() => [
        { value: 'newest', label: additionalText('newest') },
        { value: 'oldest', label: additionalText('oldest') },
        { value: 'price-low', label: additionalText('priceLowHigh') },
        { value: 'price-high', label: additionalText('priceHighLow') },
        { value: 'name-asc', label: additionalText('nameAZ') },
        { value: 'name-desc', label: additionalText('nameZA') }
    ] as const, [language]);

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

    // Función para agregar producto al carrito con efecto visual
    const handleAddToCart = async (product: PublicProduct) => {
        // Iniciar efecto visual en el botón
        setLoadingCartButton(product.id);
        
        // Verificar si el producto tiene variantes disponibles
        const variantFields = ['color', 'size', 'size_clothing', 'size_shoes', 'material', 'style', 'clothing_style'];
        const availableVariants = product.tags ? Object.entries(product.tags).filter(([key, value]) => {
            return variantFields.includes(key) && Array.isArray(value) && value.length > 1;
        }) : [];
        
        const hasVariants = availableVariants.length > 0;

        // Crear información sobre qué variantes tiene disponibles
        let missingVariants: string[] = [];
        if (hasVariants) {
            missingVariants = availableVariants.map(([key]) => {
                const displayNames: { [k: string]: string } = {
                    'color': 'color',
                    'size': 'talla',
                    'size_clothing': 'talla',
                    'size_shoes': 'talla',
                    'material': 'material',
                    'style': 'estilo',
                    'clothing_style': 'estilo'
                };
                return displayNames[key] || key;
            });
        }

        // Demora antes de agregar al carrito (800ms para un efecto visual agradable)
        await new Promise(resolve => setTimeout(resolve, 800));

        addItem({
            id: product.id, // Campo requerido por CartItem
            productId: product.id,
            name: product.name,
            price: product.price,
            currency: storeInfo?.currency || 'COP',
            image: product.image || '',
            slug: product.slug || product.id,
            // Marcar como incompleto si tiene variantes
            incomplete: hasVariants,
            missingVariants: hasVariants ? missingVariants : undefined
        }, 1);
        
        // Abrir el carrito automáticamente después de agregar el producto
        openCart();
        
        // Feedback visual opcional (puede implementarse después)
        console.log(`Agregado al carrito: ${product.name}${hasVariants ? ' (opciones pendientes)' : ''}`);
    };

    // Verificar si hay más productos para mostrar
    const hasMoreProducts = sortedProducts.length > productsToShow;

    if (loading) {
        return <UnifiedLoading storeInfo={storeInfo} />;
    }

    // Encontrar la categoría actual si estamos en una página de categoría
    const currentCategory = isOnCategoryPage ? 
        categories?.find(c => c.slug === categorySlugFromUrl) : null;

    return (
        <div data-theme="new-base-default" className={`nbd-theme ${getTextureClass()}`}>
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
{t('home')}
                            </a>
                            <span className="nbd-breadcrumbs-sep">/</span>
                            <span className="nbd-breadcrumb-current">{currentCategory.name}</span>
                        </nav>
                    </div>
                </div>
            )}
            
            {/* Sección de subcategorías - Solo en páginas de categoría */}
            {(() => {
                console.log('🔍 Checking subcategories render conditions:', {
                    isOnCategoryPage,
                    hasCurrentCategory: !!currentCategory,
                    subcategoriesCount: currentCategorySubcategories.length,
                    shouldRender: isOnCategoryPage && currentCategory && currentCategorySubcategories.length > 0
                });
                
                return isOnCategoryPage && currentCategory && currentCategorySubcategories.length > 0;
            })() && (
                <section className="nbd-subcategories-section">
                    <div className="nbd-container">
                        <div className="nbd-subcategories-grid">
                            {/* Botón "Todas" para mostrar todos los productos */}
                            <button
                                onClick={() => setSelectedSubcategory(null)}
                                className={`nbd-subcategory-button ${!selectedSubcategory ? 'nbd-subcategory-button--active' : ''}`}
                            >
                                <span className="nbd-subcategory-name">Todas</span>
                            </button>
                            
                            {/* Botones de subcategorías */}
                            {currentCategorySubcategories.map((subcategory) => (
                                <button
                                    key={subcategory.id}
                                    onClick={() => setSelectedSubcategory(subcategory.slug)}
                                    className={`nbd-subcategory-button ${selectedSubcategory === subcategory.slug ? 'nbd-subcategory-button--active' : ''}`}
                                >
                                    <span className="nbd-subcategory-name">{subcategory.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            
            {/* Si estamos en una página de colección, mostrar header limpio */}
            {isOnCollectionPage && currentCollection && (
                <div className="nbd-category-page-header">
                    <div className="nbd-container">
                        <h1 className="nbd-category-title">{currentCollection.title}</h1>
                        {currentCollection.description && (
                            <p className="nbd-category-description">{currentCollection.description}</p>
                        )}
                        
                        {/* Breadcrumbs debajo del título */}
                        <nav className="nbd-category-breadcrumbs">
                            <a href={buildUrl('')} className="nbd-breadcrumb-link">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {t('home')}
                            </a>
                            <span className="nbd-breadcrumbs-sep">/</span>
                            <span className="nbd-breadcrumb-current">{currentCollection.title}</span>
                        </nav>
                    </div>
                </div>
            )}

            {/* Si estamos en una página de marca, mostrar header limpio */}
            {isOnBrandPage && currentBrand && (
                <div className="nbd-category-page-header">
                    <div className="nbd-container">
                        <h1 className="nbd-category-title">{currentBrand.name}</h1>
                        {currentBrand.description && (
                            <p className="nbd-category-description">{currentBrand.description}</p>
                        )}
                        
                        {/* Breadcrumbs debajo del título */}
                        <nav className="nbd-category-breadcrumbs">
                            <a href={buildUrl('')} className="nbd-breadcrumb-link">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {t('home')}
                            </a>
                            <span className="nbd-breadcrumbs-sep">/</span>
                            <span className="nbd-breadcrumb-current">{currentBrand.name}</span>
                        </nav>
                    </div>
                </div>
            )}
            
            {/* Hero Section Moderno - Solo en home */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && (
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
                                    <span>{t('exploreProducts')}</span>
                                    <svg className="nbd-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </a>
                                <a href="#categorias" className="nbd-btn nbd-btn--secondary">
                                    {t('viewCategories')}
                                </a>
                            </div>
                        </div>
                        
                        <div className="nbd-hero-visual">
                            {(() => {
                                // Priorizar nuevo formato de media, fallback a imagen legacy
                                const heroMediaUrl = storeInfo?.heroMediaUrl || storeInfo?.heroImageUrl;
                                const heroMediaType = storeInfo?.heroMediaType || (storeInfo?.heroImageUrl ? 'image' : null);
                                
                                if (heroMediaUrl) {
                                    return (
                                        <div className="nbd-hero-media">
                                            {heroMediaType === 'video' ? (
                                                <video
                                                    ref={heroVideoRef}
                                                    src={heroMediaUrl}
                                                    className="nbd-hero-video"
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                    disablePictureInPicture
                                                    controls={false}
                                                    controlsList="nodownload nofullscreen noremoteplayback"
                                                />
                                            ) : (
                                                <img
                                                    src={toCloudinarySquare(heroMediaUrl, 1200)}
                                                    alt={storeInfo.storeName || 'Hero'}
                                                    className="nbd-hero-img"
                                                />
                                            )}
                                            <div className="nbd-hero-image-overlay"></div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="nbd-hero-placeholder">
                                            <div className="nbd-placeholder-grid">
                                                <div className="nbd-placeholder-item"></div>
                                                <div className="nbd-placeholder-item"></div>
                                                <div className="nbd-placeholder-item"></div>
                                                <div className="nbd-placeholder-item"></div>
                                            </div>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* Sección de Colecciones - Solo en home */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && collections && collections.length > 0 && (
                <CollectionsMosaic 
                    collections={collections}
                    storeSubdomain={storeSubdomain}
                />
            )}

            {/* Sección de categorías con mosaico inteligente - Solo en home */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && (() => {
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
                                <h2 className="nbd-section-title">{t('categories')}</h2>
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
                    {/* Solo mostrar header de productos en home, no en páginas de categoría, colección o marca */}
                    {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && (
                        <div className="nbd-section-header">
                                                        <h2 className="nbd-section-title">
                                {activeCategory ?
                                    `${categories?.find(c => c.slug === activeCategory)?.name || t('products')}` :
                                    t('products')
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
                            <span>{t('filters')}</span>
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
                                <span>{t('sortOrder')}</span>
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
                            <span>{t('viewType')}</span>
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
                                            <span className="nbd-placeholder-text">{additionalText('noImage')}</span>
                                        </div>
                                        
                                        {!product.image && !product.mediaFiles?.[0]?.url && (
                                            <div className="nbd-product-placeholder">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                                    <path d="M4 16L4 18C4 19.1046 4.89543 20 6 20L18 20C19.1046 20 20 19.1046 20 18L20 16M16 12L12 16M12 16L8 12M12 16L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span className="nbd-placeholder-text">{additionalText('noImage')}</span>
                                            </div>
                                        )}
                                        
                                        {product.comparePrice && product.comparePrice > product.price && (
                                            <div className="nbd-product-badge">
                                                {additionalText('offer')}
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
                                className={`nbd-add-to-cart ${loadingCartButton === product.id ? 'nbd-add-to-cart--loading' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(product);
                                }}
                                aria-label={`Agregar ${product.name} al carrito`}
                                disabled={loadingCartButton === product.id}
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
                                <h3 className="nbd-empty-title">{additionalText('noProductsCategory')}</h3>
                                <p className="nbd-empty-description">{additionalText('exploreOther')}</p>
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
                                className="nbd-btn nbd-btn--secondary"
                                style={{
                                    minWidth: '200px',
                                    transition: 'all var(--nbd-transition-base)'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <span>{additionalText('loadMore')} ({Math.min(8, filteredProducts.length - productsToShow)})</span>
                            </button>
                            <p style={{
                                fontSize: 'var(--nbd-font-size-sm)',
                                color: 'var(--nbd-neutral-600)',
                                marginTop: 'var(--nbd-space-md)',
                                marginBottom: '0'
                            }}>
{additionalText('showing')} {displayedProducts.length} {additionalText('of')} {filteredProducts.length} {additionalText('products')}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Carrusel Simple */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && storeInfo?.carouselImages && storeInfo.carouselImages.length > 0 && (
                <section className="nbd-carousel-section">
                    <div className="nbd-carousel-container">
                        <div 
                            className="nbd-carousel-wrapper"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {storeInfo.carouselImages
                                .sort((a, b) => a.order - b.order)
                                .map((image, index) => (
                                <div 
                                    key={image.publicId} 
                                    className="nbd-carousel-slide"
                                    style={{
                                        transform: `translateX(${(index - currentSlide) * 100}%)`
                                    }}
                                >
                                    <img
                                        src={image.url}
                                        alt={`Promoción ${index + 1}`}
                                        className="nbd-carousel-image"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="nbd-carousel-indicators">
                            {storeInfo.carouselImages.map((_, index) => (
                                <button
                                    key={index}
                                    className={`nbd-carousel-dot ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => goToSlide(index)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Sección de Newsletter */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && (
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
                                {additionalText('newsletterTitle')}
                            </h2>
                            <p className="nbd-newsletter-description">
                                {additionalText('newsletterDescription')}
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
                                        <span>${additionalText('subscribed')}</span>
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
                                        placeholder={additionalText('emailPlaceholder')}
                                        className="nbd-newsletter-input"
                                        autoComplete="email"
                                        required
                                    />
                                    <button type="submit" className="nbd-newsletter-submit">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                        <span>{t('subscribe')}</span>
                                    </button>
                                </div>
                                <p className="nbd-newsletter-privacy">
                                    {additionalText('privacyNotice')}
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* Sección de Marcas Carousel - Solo en home */}
            {!isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage && brands && brands.length > 0 && (
                <section className="nbd-brands-carousel">
                    <div className="nbd-container">
                        <div className="nbd-section-header">
                            <h2 className="nbd-section-title">{additionalText('ourBrands')}</h2>
                            <p className="nbd-section-subtitle">
                                {additionalText('brandSubtitle')}
                            </p>
                        </div>
                        
                        <div 
                            className="nbd-brands-container"
                            onScroll={isMobile ? (e) => {
                                // Evitar loops infinitos durante saltos
                                if (isJumpingRef.current) return;
                                
                                const container = e.currentTarget;
                                const scrollLeft = container.scrollLeft;
                                const scrollWidth = container.scrollWidth;
                                const clientWidth = container.clientWidth;
                                const maxScroll = scrollWidth - clientWidth;
                                
                                // Calcular el ancho de un conjunto completo de marcas
                                const singleSetWidth = maxScroll / 3; // 4 copias = 3 intervalos
                                
                                // Limpiar timeout anterior
                                if (scrollTimeoutRef.current) {
                                    clearTimeout(scrollTimeoutRef.current);
                                }
                                
                                // Usar timeout para hacer salto después de que el usuario pare de hacer scroll
                                scrollTimeoutRef.current = setTimeout(() => {
                                    // Saltar solo si estamos muy cerca de los límites
                                    if (scrollLeft >= singleSetWidth * 2.9) { // 90% del tercer conjunto
                                        isJumpingRef.current = true;
                                        // Deshabilitar scroll suave temporalmente para salto instantáneo
                                        const originalScrollBehavior = container.style.scrollBehavior;
                                        container.style.scrollBehavior = 'auto';
                                        
                                        requestAnimationFrame(() => {
                                            container.scrollLeft = singleSetWidth * 0.9; // Equivalente en el primer conjunto
                                            
                                            // Restaurar scroll suave después del salto
                                            requestAnimationFrame(() => {
                                                container.style.scrollBehavior = originalScrollBehavior;
                                                isJumpingRef.current = false;
                                            });
                                        });
                                    }
                                    else if (scrollLeft <= singleSetWidth * 0.1) { // 10% del primer conjunto
                                        isJumpingRef.current = true;
                                        // Deshabilitar scroll suave temporalmente para salto instantáneo
                                        const originalScrollBehavior = container.style.scrollBehavior;
                                        container.style.scrollBehavior = 'auto';
                                        
                                        requestAnimationFrame(() => {
                                            container.scrollLeft = singleSetWidth * 2.1; // Equivalente en el tercer conjunto
                                            
                                            // Restaurar scroll suave después del salto
                                            requestAnimationFrame(() => {
                                                container.style.scrollBehavior = originalScrollBehavior;
                                                isJumpingRef.current = false;
                                            });
                                        });
                                    }
                                }, 100); // Esperar 100ms después de que pare el scroll
                            } : undefined}
                        >
                            <div className="nbd-brands-track" 
                                 style={{ 
                                     '--brands-count': brands.length,
                                     '--animation-duration': `${brands.length * 4}s`
                                 } as React.CSSProperties}>
                                {/* Duplicar las marcas: desktop 2x, móvil 4x para scroll infinito */}
                                {(isMobile ? 
                                    [...brands, ...brands, ...brands, ...brands] : 
                                    [...brands, ...brands]
                                ).map((brand, index) => (
                                    <a 
                                        key={`${brand.id}-${index}`} 
                                        href={buildUrl(`/marca/${brand.slug}`)}
                                        className="nbd-brand-item"
                                    >
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
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <Footer storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} storeId={storeId || undefined} />

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
                            <h3 className="nbd-modal-title">{t('filters')}</h3>
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
                                    <h4>{additionalText('noFiltersAvailable')}</h4>
                                    <p>{additionalText('filtersConfigured')}</p>
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
{additionalText('clearFilters')}
                                </button>
                                <button 
                                    className="nbd-btn nbd-btn--primary"
                                    onClick={() => setFiltersModalOpen(false)}
                                >
{additionalText('apply')} ({getActiveFiltersCount()})
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal del carrito */}
            <CartModal storeInfo={storeInfo} storeId={resolvedStoreId || undefined} />
        </div>
    );
}
