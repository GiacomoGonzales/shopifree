"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import "./minimal-clean.css";
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

export default function MinimalClean({ storeSubdomain }: Props) {

    const t = useTranslations('common');

	const [storeId, setStoreId] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<PublicProduct[] | null>(null);
    const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [brands, setBrands] = useState<PublicBrand[] | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [mobileView, setMobileView] = useState<"expanded" | "grid2" | "list">("expanded");
    const [isAnimatingView, setIsAnimatingView] = useState<boolean>(false);
    type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
    const [sortOption, setSortOption] = useState<SortOption>("relevance");
    const [showSort, setShowSort] = useState<boolean>(false);

    // Persistencia simple en localStorage (solo cliente)
    useEffect(() => {
        try {
            const savedView = localStorage.getItem("mc:mobileView");
            if (savedView === "expanded" || savedView === "grid2" || savedView === "list") {
                setMobileView(savedView);
            }
            const savedSort = localStorage.getItem("mc:sortOption") as SortOption | null;
            if (savedSort && ["relevance","price-asc","price-desc","name-asc","name-desc"].includes(savedSort)) {
                setSortOption(savedSort);
            }
        } catch {}
    }, []);

    useEffect(() => {
        try { localStorage.setItem("mc:mobileView", mobileView); } catch {}
        // trigger smooth animation on view change
        setIsAnimatingView(true);
        const t = setTimeout(() => setIsAnimatingView(false), 260);
        return () => clearTimeout(t);
    }, [mobileView]);

    useEffect(() => {
        try { localStorage.setItem("mc:sortOption", sortOption); } catch {}
    }, [sortOption]);

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

    // Enforce preferred store language via cookie and URL locale segment (client-side best-effort)
    useEffect(() => {
        try {
            if (!storeInfo?.language) return;
            const preferred = storeInfo.language; // 'es' | 'en'
            const path = window.location.pathname;
            const parts = path.split('/').filter(Boolean);
            const currentLocale = parts[0] || '';
            // Cookie por subdominio para que el middleware pueda leer preferencia (opcional)
            document.cookie = `sf:locale:${storeSubdomain}=${preferred}; path=/; max-age=31536000`;
            if (currentLocale !== preferred) {
                const rest = parts.slice(2).join('/'); // excluir locale y subdominio actuales
                const newUrl = `/${preferred}/${storeSubdomain}${rest ? `/${rest}` : ''}`;
                if (newUrl !== window.location.pathname) {
                    window.location.replace(newUrl);
                }
            }
        } catch {}
    }, [storeInfo?.language, storeSubdomain]);

    const hasProducts = Array.isArray(products) && products.length > 0;
    const topLevelCategories = useMemo(() => (Array.isArray(categories) ? categories.filter(c => !c.parentCategoryId) : []), [categories]);
    const visibleProducts = useMemo(() => {
        if (!hasProducts) return [] as PublicProduct[];
        let base: PublicProduct[] = products as PublicProduct[];
        if (activeCategory) {
            try {
                base = base.filter((p: any) => {
                    const slugs: string[] = (p?.categorySlugs as string[]) || (p?.categories?.map((c: any) => c?.slug).filter(Boolean)) || (p?.categorySlug ? [p.categorySlug] : []);
                    if (!Array.isArray(slugs) || slugs.length === 0) return true;
                    return slugs.includes(activeCategory);
                });
            } catch {}
        }
        // ordenamiento
        const list = [...base];
        switch (sortOption) {
            case "price-asc":
                list.sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY));
                break;
            case "price-desc":
                list.sort((a, b) => (b.price ?? Number.NEGATIVE_INFINITY) - (a.price ?? Number.NEGATIVE_INFINITY));
                break;
            case "name-asc":
                list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
                break;
            case "name-desc":
                list.sort((a, b) => String(b.name || "").localeCompare(String(a.name || "")));
                break;
            default:
                break; // relevance: mantiene orden original
        }
        return list;
    }, [products, hasProducts, activeCategory, sortOption]);

    if (loading) {
		return (
			<div data-theme="minimal-clean">
				<div className="mc-loading">
                    <div className="mc-spinner" aria-label={t('loading')} />
				</div>
			</div>
		);
	}

    return (
        <div data-theme="minimal-clean">
            <Header storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} />

            <section className="mc-hero">
                <div className="mc-hero-copy">
                    <h1>{storeInfo?.storeName || storeSubdomain}</h1>
                    {storeInfo?.description ? <p>{storeInfo.description}</p> : null}
                    <div className="mc-cta">
                        <a className="mc-btn" href="#ofertas">{t('offers')}</a>
                        <a className="mc-btn mc-btn--outline" href="#catalogo">{t('catalog')}</a>
                    </div>
                </div>
                <div className="mc-hero-media">
                    {storeInfo?.heroImageUrl ? (
                        <img src={toCloudinarySquare(storeInfo.heroImageUrl, 1200)} alt={storeInfo.storeName} />
                    ) : (
                        <div />
                    )}
                </div>
            </section>

			<section id="products" className="mc-products">
                <div className="mc-toolbar">
                    <div className="mc-toolbar-title">{t('nav.categories')}</div>
                    <div className="mc-toolbar-subtitle">&nbsp;</div>
                    <div className="mc-toolbar-inner">
                        <button className={`mc-chip ${!activeCategory ? "is-active" : ""}`} onClick={() => setActiveCategory(null)}>{t('all')}</button>
						{topLevelCategories.map((c) => (
							<button key={c.id} className={`mc-chip ${activeCategory === c.slug ? "is-active" : ""}`} onClick={() => setActiveCategory(c.slug)}>
								{c.name}
							</button>
						))}
					</div>
                    <div className="mc-mobile-actions" aria-label="Acciones de productos (solo móvil)">
                        <button className="mc-btn mc-btn--outline mc-btn--sm" type="button">{t('actions.filters')}</button>
                        <button
                            className="mc-btn mc-btn--outline mc-btn--sm"
                            type="button"
                            aria-expanded={showSort}
                            onClick={() => setShowSort((v) => !v)}
                        >
                            {t('actions.order')}
                        </button>
                        <button
                            className="mc-btn mc-btn--outline mc-btn--sm mc-btn--icon"
                            type="button"
                            aria-label={mobileView === "expanded" ? "Cambiar vista, actual: expandida" : mobileView === "grid2" ? "Cambiar vista, actual: 2 por fila" : "Cambiar vista, actual: lista"}
                            title={mobileView === "expanded" ? "Vista actual: expandida" : mobileView === "grid2" ? "Vista actual: 2 por fila" : "Vista actual: lista"}
                            onClick={() => setMobileView(mobileView === "expanded" ? "grid2" : mobileView === "grid2" ? "list" : "expanded")}
                        >
                            {mobileView === "expanded" && (
                                <svg className="mc-icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <rect x="3.5" y="5" width="17" height="14" rx="3"/>
                                    <path d="M7 10h10M7 14h7" strokeLinecap="round"/>
                                </svg>
                            )}
                            {mobileView === "grid2" && (
                                <svg className="mc-icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <rect x="4" y="5" width="7" height="7" rx="2"/>
                                    <rect x="13" y="5" width="7" height="7" rx="2"/>
                                    <rect x="4" y="14" width="7" height="7" rx="2"/>
                                    <rect x="13" y="14" width="7" height="7" rx="2"/>
                                </svg>
                            )}
                            {mobileView === "list" && (
                                <svg className="mc-icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <rect x="4" y="6" width="7" height="7" rx="2"/>
                                    <path d="M13 7.5h7M13 11h6" strokeLinecap="round"/>
                                </svg>
                            )}
                        </button>
                    </div>
                    {showSort && (
                        <>
                            <button className="mc-sheet-backdrop" aria-hidden onClick={() => setShowSort(false)} />
                            <div className="mc-sheet" role="dialog" aria-modal="true" aria-label={t('sort.title')}>
                                <div className="mc-sheet-panel">
                                    <div className="mc-sheet-header">
                                        <span>{t('sort.title')}</span>
                                        <button className="mc-icon-link" aria-label="Cerrar" onClick={() => setShowSort(false)}>
                                            <svg className="mc-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                                        </button>
                                    </div>
                                    <div className="mc-sheet-body">
                                        <button className={`mc-sort-item ${sortOption === "relevance" ? "is-active" : ""}`} onClick={() => { setSortOption("relevance"); setShowSort(false); }}>{t('sort.relevance')}</button>
                                        <button className={`mc-sort-item ${sortOption === "price-asc" ? "is-active" : ""}`} onClick={() => { setSortOption("price-asc"); setShowSort(false); }}>{t('sort.priceAsc')}</button>
                                        <button className={`mc-sort-item ${sortOption === "price-desc" ? "is-active" : ""}`} onClick={() => { setSortOption("price-desc"); setShowSort(false); }}>{t('sort.priceDesc')}</button>
                                        <button className={`mc-sort-item ${sortOption === "name-asc" ? "is-active" : ""}`} onClick={() => { setSortOption("name-asc"); setShowSort(false); }}>{t('sort.nameAsc')}</button>
                                        <button className={`mc-sort-item ${sortOption === "name-desc" ? "is-active" : ""}`} onClick={() => { setSortOption("name-desc"); setShowSort(false); }}>{t('sort.nameDesc')}</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
				</div>

				<div className={`mc-grid ${mobileView === "grid2" ? "mobile-grid2" : mobileView === "list" ? "mobile-list" : "mobile-expanded"} ${isAnimatingView ? "is-animating" : ""} grid-base grid-base-products`}>
                {hasProducts && visibleProducts.map((p) => (
					<article key={p.id} className={`mc-card card-base product-card-transition ${mobileView === "list" ? "product-card-base-list is-list" : "product-card-base-compact"}`} onClick={(e) => {
                        try {
                            const base = window.location.pathname.split('/').filter(Boolean);
                            const locale = base[0];
                            const sub = base[1];
                            const slug = (p as any).slug || p.id;
                            // Permitir click en elementos interactivos internos sin navegar
                            const target = e.target as HTMLElement;
                            if (target.closest('button,a')) return;
                            window.location.href = `/${locale}/${sub}/producto/${encodeURIComponent(slug)}`;
                        } catch {}
                    }} role="link" tabIndex={0}>
						<div className="mc-media product-image">
						{"video" in p && (p as any).video ? (
								<video src={(p as any).video} muted autoPlay playsInline loop preload="metadata" />
						) : ("image" in p && (p as any).image ? (
								<img src={toCloudinarySquare((p as any).image, 600)} alt={("name" in p ? p.name : (p as any).title) || "Producto"} loading="lazy" />
						) : (
								<div />
						))}
						</div>
						<div className="mc-body">
							<h3 className="mc-title product-title">{"name" in p ? p.name : (p as any).title}</h3>
							<p className="mc-price">
								<span className="price-current">
									{storeInfo?.currency ? (
										new Intl.NumberFormat(undefined, { style: "currency", currency: storeInfo.currency, currencyDisplay: "symbol", minimumFractionDigits: 0 }).format(("price" in p ? (p.price as number) : (p as any).price) as number)
									) : (
										`$${"price" in p ? p.price : (p as any).price}`
									)}
								</span>
								{(p as any).comparePrice ? (
									<span className="price-original" style={{ marginLeft: 8 }}>
										{storeInfo?.currency ? (
											new Intl.NumberFormat(undefined, { style: "currency", currency: storeInfo.currency, currencyDisplay: "symbol", minimumFractionDigits: 0 }).format((p as any).comparePrice as number)
										) : (
											`$${(p as any).comparePrice}`
										)}
									</span>
								) : null}
							</p>
						</div>
					</article>
				))}
				</div>
			</section>

            {Array.isArray(brands) && brands.length > 0 && (
				<section className="mc-brands" aria-label="Marcas">
					<div className="mc-brands-inner">
                        <div className="mc-brands-title">{t('brands.title')}</div>
                        <div className="mc-brands-subtitle">{t('brands.subtitle')}</div>
						<div className="mc-brands-track">
							{Array.from({ length: 4 }).flatMap(() => brands).map((b, i) => (
								<a key={`brand-${b.id}-${i}`} className="mc-brand" href={`/#brand-${b.id}`} onClick={(e) => { (e.currentTarget as HTMLAnchorElement).classList.add("is-active"); }}>
									{b.image ? (
										<img src={b.image} alt={b.name} loading="lazy" />
									) : (
										<span>{b.name}</span>
									)}
								</a>
							))}
						</div>
					</div>
				</section>
			)}

            <Footer storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} />
		</div>
	);
}


