"use client";

import { useEffect, useState } from 'react';
import { getStoreIdBySubdomain } from '../../../../../lib/store';
import { getProduct, getProductBySlug, PublicProduct } from '../../../../../lib/products';
import { toCloudinarySquare } from '../../../../../lib/images';
import Layout from '../../../../../themes/minimal-clean/Layout';
import { getStoreBasicInfo, StoreBasicInfo } from '../../../../../lib/store';
import { getStoreCategories, Category } from '../../../../../lib/categories';

type Props = {
  storeSubdomain: string;
  productSlug: string;
  locale?: string;
};

export default function ProductDetail({ storeSubdomain, productSlug, locale }: Props) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const id = await getStoreIdBySubdomain(storeSubdomain);
        if (!alive) return;
        setStoreId(id);
        if (id) {
          const p = await getProduct(id, productSlug);
          if (!alive) return;
          setProduct(p);
          // cargar info base para header/footer
          const [info, cats] = await Promise.all([
            getStoreBasicInfo(id),
            getStoreCategories(id)
          ]);
          if (!alive) return;
          setStoreInfo(info);
          setCategories(cats);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [storeSubdomain, productSlug]);

  // Precompute JSON-LD for all renders to keep hooks order consistent
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const l = locale || 'es';
  const sub = storeSubdomain;

  const breadcrumbJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${origin}/${l}/${sub}` },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${origin}/${l}/${sub}/catalogo` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${origin}/${l}/${sub}/producto/${encodeURIComponent(product.slug || product.id)}` }
    ]
  } : null;

  const productJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: product.image ? [product.image] : undefined,
    sku: product.id,
    offers: (product.price != null) ? {
      '@type': 'Offer',
      price: String(product.price),
      priceCurrency: product.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url: `${origin}/${l}/${sub}/producto/${encodeURIComponent(product.slug || product.id)}`
    } : undefined
  } : null;

  if (loading) {
    return <div className="container">Cargando…</div>;
  }

  if (!product) {
    return <div className="container"><h1>Producto no encontrado</h1></div>;
  }

  const cover = product.video ? (
    <video src={product.video} muted autoPlay playsInline loop preload="metadata" />
  ) : product.image ? (
    <img src={toCloudinarySquare(product.image, 900)} alt={product.name} />
  ) : <div />;

  return (
    <Layout storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain}>
      {/* JSON-LD SEO */}
      {breadcrumbJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      ) : null}
      {productJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      ) : null}
      {/* Breadcrumb visible */}
      <nav className="mc-breadcrumbs" aria-label="Breadcrumb">
        <a href={`/${l}/${storeSubdomain}`}>Inicio</a>
        <span className="mc-breadcrumbs-sep">/</span>
        <a href={`/${l}/${storeSubdomain}/catalogo`}>Catálogo</a>
        <span className="mc-breadcrumbs-sep">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="mc-product">
        <div className="mc-product-media">
          {cover}
        </div>
        <div>
          <h1 className="mc-product-title">{product.name}</h1>
          {typeof product.price === 'number' ? (
            <p className="mc-product-price">
              {new Intl.NumberFormat(undefined, { style: 'currency', currency: product.currency || 'USD', minimumFractionDigits: 0 }).format(product.price)}
            </p>
          ) : null}

          {product.description ? (
            <div className="mc-product-description" dangerouslySetInnerHTML={{ __html: product.description }} />
          ) : null}

          <div className="mc-product-actions">
            <button className="mc-btn">Comprar</button>
            <button className="mc-btn mc-btn--outline" onClick={() => history.back()}>Volver</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}


