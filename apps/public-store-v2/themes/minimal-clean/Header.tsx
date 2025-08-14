"use client";

import { useEffect, useMemo, useState } from "react";
import { StoreBasicInfo } from "../../lib/store";
import { Category } from "../../lib/categories";
import { toCloudinarySquare } from "../../lib/images";

type Props = {
	storeInfo: StoreBasicInfo | null;
	categories: Category[] | null;
	storeSubdomain: string;
};

export default function Header({ storeInfo, categories, storeSubdomain }: Props) {
	const [isScrolled, setIsScrolled] = useState(false);
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

	const getSubdomainUrl = (path: string) => `/${locale}/${storeSubdomain}${path}`;

	return (
		<header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white/90 backdrop-blur-sm"}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-20">
					{/* Logo */}
					<div className="flex-shrink-0">
						<a className="flex items-center gap-3 hover-scale" href={getSubdomainUrl("")} aria-label="Ir al inicio de la tienda">
							{storeInfo?.logoUrl ? (
								<div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center">
									<img src={toCloudinarySquare(storeInfo.logoUrl, 200)} alt={storeInfo?.storeName || storeSubdomain} className="w-full h-full object-contain" />
								</div>
							) : (
								<div className="w-8 h-8 bg-neutral-900 rounded-sm flex items-center justify-center">
									<span className="text-white font-bold text-sm">{(storeInfo?.storeName || storeSubdomain).charAt(0).toUpperCase()}</span>
								</div>
							)}
							<span className="text-xl font-light text-neutral-900 tracking-tight">{storeInfo?.storeName || storeSubdomain}</span>
						</a>
					</div>

					{/* Navegación principal */}
					<nav className="hidden md:flex items-center gap-6 relative">
						{topCategories.map(cat => {
							const children = subcategoriesByParent[cat.id] || [];
							const hasChildren = children.length > 0;
							return (
								<div
									key={cat.id}
									className="relative"
									onMouseEnter={() => hasChildren && setHoveredCategory(cat.id)}
									onMouseLeave={() => setHoveredCategory(null)}
								>
									<a
										href={getSubdomainUrl(`/categoria/${cat.slug}`)}
										className="text-sm font-light text-neutral-600 hover:text-neutral-900 transition-colors duration-200 relative group flex items-center"
									>
										{cat.name}
										{hasChildren && (
											<span className="ml-1">
												<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
											</span>
										)}
										<span className="absolute -bottom-1 left-0 w-0 h-px bg-neutral-900 transition-all duration-200 group-hover:w-full" />
									</a>
									{hasChildren && hoveredCategory === cat.id && (
										<div className="absolute top-full left-0 pt-2 w-64 z-50">
											<div className="bg-white border border-neutral-200 rounded-lg shadow-lg">
												<div className="py-2">
													{children.map(sub => (
														<a key={sub.id} href={getSubdomainUrl(`/categoria/${cat.slug}/${sub.slug}`)} className="block px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors duration-200">
															{sub.name}
														</a>
													))}
												</div>
											</div>
										</div>
									)}
							);
						})}
					</nav>

					{/* Acciones */}
					<div className="flex items-center gap-2">
						<a className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 hover-scale" href={getSubdomainUrl("/favoritos")} aria-label="Favoritos">
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
						</a>
						<button className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200" aria-label="Abrir menú" onClick={() => setMobileMenuOpen(true)}>
							<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 7h16M4 12h16M4 17h16" strokeWidth="1.5" strokeLinecap="round"/></svg>
						</button>
					</div>
				</div>
			</div>

			{/* Menú móvil */}
			<div className={`fixed inset-0 z-[60] md:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
				<div className={`fixed inset-0 bg-black transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-25' : 'opacity-0'}`} onClick={() => setMobileMenuOpen(false)} />
				<div className={`fixed right-0 top-0 h-full w-80 max-w-sm bg-white shadow-lg transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
					<div className="flex items-center justify-between p-4 border-b border-neutral-200">
						<span className="text-lg font-light text-neutral-900">Menú</span>
						<button onClick={() => setMobileMenuOpen(false)} className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 6l12 12M18 6L6 18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
					</div>
					<nav className="px-4 py-6 space-y-2">
						{topCategories.map(cat => (
							<a key={cat.id} href={getSubdomainUrl(`/categoria/${cat.slug}`)} className="block py-3 text-neutral-900 font-light border-b border-neutral-100 hover:text-neutral-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>
								{cat.name}
							</a>
						))}
					</nav>
				</div>
			</div>
		</header>
	);
}


