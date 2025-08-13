import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductDetail from './product-detail';
import { getStoreIdBySubdomain } from '../../../../../lib/store';
import { getProduct } from '../../../../../lib/products';

export default function ProductoPage({ params }: { params: { productSlug: string; locale: string; storeSubdomain: string } }) {
    const { productSlug, storeSubdomain, locale } = params as any;
    return (
        <Suspense fallback={<div className="container">Cargando…</div>}>
            <ProductDetail productSlug={productSlug} storeSubdomain={storeSubdomain} locale={locale} />
        </Suspense>
    );
}

export async function generateMetadata({ params }: { params: { productSlug: string; storeSubdomain: string } }): Promise<Metadata> {
  try {
    const storeId = await getStoreIdBySubdomain(params.storeSubdomain);
    if (!storeId) return { title: 'Producto' };
    const product = await getProduct(storeId, params.productSlug);
    if (!product) return { title: 'Producto' };
    const title = product.name || 'Producto';
    const description = product.description || undefined;
    const image = product.image || undefined;
    return {
      title,
      description,
      openGraph: {
        title,
        description: description || undefined,
        images: image ? [image] : undefined
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: description || undefined,
        images: image ? [image] : undefined
      }
    };
  } catch {
    return { title: 'Producto' };
  }
}


