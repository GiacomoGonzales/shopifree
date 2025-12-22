import { notFound } from 'next/navigation';
import { getStoreBySubdomain, getStoreProducts, getStoreCategories } from '@/lib/store';
import CatalogClient from './CatalogClient';

interface Props {
  params: { store: string };
}

export default async function StorePage({ params }: Props) {
  const subdomain = params.store;

  // Fetch store data
  const store = await getStoreBySubdomain(subdomain);

  if (!store) {
    notFound();
  }

  // Fetch products and categories
  const [products, categories] = await Promise.all([
    getStoreProducts(store.id),
    getStoreCategories(store.id),
  ]);

  return (
    <CatalogClient
      store={store}
      products={products}
      categories={categories}
    />
  );
}

// Generate metadata
export async function generateMetadata({ params }: Props) {
  const store = await getStoreBySubdomain(params.store);

  if (!store) {
    return { title: 'Catalogo no encontrado' };
  }

  return {
    title: store.storeName,
    description: store.slogan || `Catalogo de ${store.storeName}`,
  };
}
