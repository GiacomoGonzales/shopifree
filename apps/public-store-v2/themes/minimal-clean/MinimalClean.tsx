"use client";

import { useEffect, useState, useMemo } from "react";
import "./minimal-clean.css";
import { getStoreIdBySubdomain, getStoreBasicInfo, StoreBasicInfo } from "../../lib/store";
import { getStoreProducts, PublicProduct } from "../../lib/products";
import { getStoreCategories, Category } from "../../lib/categories";
import { toCloudinarySquare } from "../../lib/images";

type Props = {
	storeSubdomain: string;
};

export default function MinimalClean({ storeSubdomain }: Props) {

	const [storeId, setStoreId] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<PublicProduct[] | null>(null);
    const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);
    const [categories, setCategories] = useState<Category[] | null>(null);
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
                    const [items, info, cats] = await Promise.all([
                        getStoreProducts(id),
                        getStoreBasicInfo(id),
                        getStoreCategories(id)
                    ]);
					if (!alive) return;
                    setProducts(items);
                    setStoreInfo(info);
                    setCategories(cats);
				}
			} finally {
				if (alive) setLoading(false);
			}
		})();
		return () => {
			alive = false;
		};
	}, [storeSubdomain]);

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
					<div className="mc-spinner" aria-label="Cargando" />
				</div>
			</div>
		);
	}

	return (
		<div data-theme="minimal-clean">
			<header className="mc-header">
				<div className="mc-header-inner">
					<div className="mc-logo">
						{storeInfo?.logoUrl && (
							<img src={toCloudinarySquare(storeInfo.logoUrl, 200)} alt={storeInfo?.storeName || storeSubdomain} />
						)}
						<span>{storeInfo?.storeName || storeSubdomain}</span>
					</div>
					{Array.isArray(categories) && categories.length > 0 && (
						<nav className="mc-nav" aria-label="Categorías">
							<ul>
								{categories.filter(c => !c.parentCategoryId).map((c) => (
									<li key={c.id}><a href={`/#cat-${c.slug}`}>{c.name}</a></li>
								))}
							</ul>
						</nav>
					)}
					<div className="mc-actions">
						<button className="mc-icon-link" aria-label="Buscar">
							<svg className="mc-icon" viewBox="0 0 24 24" aria-hidden="true">
								<circle cx="11" cy="11" r="7" />
								<path d="M21 21l-4.5-4.5" />
								<path d="M8.5 10.5a3.25 3.25 0 0 1 3-3" />
							</svg>
						</button>
						<button className="mc-icon-link" aria-label="Carrito">
							<svg className="mc-icon" viewBox="0 0 24 24" aria-hidden="true">
								<circle cx="9" cy="20" r="1.25" />
								<circle cx="17" cy="20" r="1.25" />
								<path d="M3 4h2l2.2 12h12.2L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
						<button className="mc-icon-link" aria-label="Mi cuenta">
							<svg className="mc-icon" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M12 12a5 5 0 1 0 0-10a5 5 0 0 0 0 10Z" />
								<path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
					</div>
				</div>
			</header>

			<section className="mc-hero">
                <div className="mc-hero-copy">
                    <h1>{storeInfo?.storeName || storeSubdomain}</h1>
                    {storeInfo?.description ? <p>{storeInfo.description}</p> : null}
                    <div className="mc-cta">
                        <a className="mc-btn" href="#ofertas">Ver Ofertas</a>
						<a className="mc-btn mc-btn--outline" href="#catalogo">Explorar Catálogo</a>
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
					<div className="mc-toolbar-title">Explora por categorías</div>
                    <div className="mc-toolbar-inner">
						<button className={`mc-chip ${!activeCategory ? "is-active" : ""}`} onClick={() => setActiveCategory(null)}>Todos</button>
						{topLevelCategories.map((c) => (
							<button key={c.id} className={`mc-chip ${activeCategory === c.slug ? "is-active" : ""}`} onClick={() => setActiveCategory(c.slug)}>
								{c.name}
							</button>
						))}
					</div>
                    <div className="mc-mobile-actions" aria-label="Acciones de productos (solo móvil)">
                        <button className="mc-btn mc-btn--outline mc-btn--sm" type="button">Filtros</button>
                        <button
                            className="mc-btn mc-btn--outline mc-btn--sm"
                            type="button"
                            aria-expanded={showSort}
                            onClick={() => setShowSort((v) => !v)}
                        >
                            Ordenar
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
                            <div className="mc-sheet" role="dialog" aria-modal="true" aria-label="Ordenar productos">
                                <div className="mc-sheet-panel">
                                    <div className="mc-sheet-header">
                                        <span>Ordenar</span>
                                        <button className="mc-icon-link" aria-label="Cerrar" onClick={() => setShowSort(false)}>
                                            <svg className="mc-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                                        </button>
                                    </div>
                                    <div className="mc-sheet-body">
                                        <button className={`mc-sort-item ${sortOption === "relevance" ? "is-active" : ""}`} onClick={() => { setSortOption("relevance"); setShowSort(false); }}>Relevancia</button>
                                        <button className={`mc-sort-item ${sortOption === "price-asc" ? "is-active" : ""}`} onClick={() => { setSortOption("price-asc"); setShowSort(false); }}>Precio: menor a mayor</button>
                                        <button className={`mc-sort-item ${sortOption === "price-desc" ? "is-active" : ""}`} onClick={() => { setSortOption("price-desc"); setShowSort(false); }}>Precio: mayor a menor</button>
                                        <button className={`mc-sort-item ${sortOption === "name-asc" ? "is-active" : ""}`} onClick={() => { setSortOption("name-asc"); setShowSort(false); }}>Nombre: A → Z</button>
                                        <button className={`mc-sort-item ${sortOption === "name-desc" ? "is-active" : ""}`} onClick={() => { setSortOption("name-desc"); setShowSort(false); }}>Nombre: Z → A</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
				</div>

                <div className={`mc-grid ${mobileView === "grid2" ? "mobile-grid2" : mobileView === "list" ? "mobile-list" : "mobile-expanded"} ${isAnimatingView ? "is-animating" : ""}`}>
                {hasProducts && visibleProducts.map((p) => (
                    <article key={p.id} className={`mc-card${mobileView === "list" ? " is-list" : ""}`}>
						<div className="mc-media">
						{"video" in p && (p as any).video ? (
								<video src={(p as any).video} muted autoPlay playsInline loop preload="metadata" />
						) : ("image" in p && (p as any).image ? (
								<img src={toCloudinarySquare((p as any).image, 600)} alt={("name" in p ? p.name : (p as any).title) || "Producto"} loading="lazy" />
						) : (
								<div />
						))}
						</div>
						<div className="mc-body">
							<h3 className="mc-title">{"name" in p ? p.name : (p as any).title}</h3>
							<p className="mc-price">${"price" in p ? p.price : (p as any).price}</p>
						</div>
					</article>
				))}
				</div>
			</section>

			<footer className="mc-footer">
				<div className="mc-footer-inner">© {new Date().getFullYear()} Shopifree</div>
			</footer>
		</div>
	);
}


