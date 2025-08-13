"use client";

import { StoreBasicInfo } from "../../lib/store";
import { Category } from "../../lib/categories";
import { toCloudinarySquare } from "../../lib/images";

type Props = {
  storeInfo: StoreBasicInfo | null;
  categories: Category[] | null;
  storeSubdomain: string;
};

export default function Header({ storeInfo, categories, storeSubdomain }: Props) {
  const getLocaleFromPath = () => {
    try {
      const parts = window.location.pathname.split('/').filter(Boolean);
      return parts[0] || 'es';
    } catch { return 'es'; }
  };
  const locale = getLocaleFromPath();
  return (
    <header className="mc-header">
      <div className="mc-header-inner">
        <a className="mc-logo" href={`/${locale}/${storeSubdomain}`} aria-label="Ir al inicio de la tienda">
          {storeInfo?.logoUrl && (
            <img src={toCloudinarySquare(storeInfo.logoUrl, 200)} alt={storeInfo?.storeName || storeSubdomain} />
          )}
          <span>{storeInfo?.storeName || storeSubdomain}</span>
        </a>
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
  );
}


