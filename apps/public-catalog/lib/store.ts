import { getFirebaseDb } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

export interface Store {
  id: string;
  storeName: string;
  subdomain: string;
  logoUrl?: string;
  slogan?: string;
  whatsappNumber?: string;
  currency: string;
  theme?: string;
  primaryColor?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  imageUrl?: string;
  categoryId?: string;
  status: string;
}

export interface Category {
  id: string;
  name: string;
  order?: number;
}

// Get store by subdomain
export async function getStoreBySubdomain(subdomain: string): Promise<Store | null> {
  console.log('[public-catalog] Buscando tienda:', subdomain);

  try {
    const db = getFirebaseDb();
    console.log('[public-catalog] Firebase DB obtenido');

    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('subdomain', '==', subdomain), limit(1));
    const snapshot = await getDocs(q);

    console.log('[public-catalog] Resultado:', snapshot.empty ? 'No encontrado' : 'Encontrado');

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();
    console.log('[public-catalog] Store data:', data.storeName);

    // Solo devolver los campos que necesitamos (evita timestamps de Firestore)
    return {
      id: doc.id,
      storeName: data.storeName,
      subdomain: data.subdomain,
      logoUrl: data.logoUrl,
      slogan: data.slogan,
      whatsappNumber: data.whatsappNumber,
      currency: data.currency || 'USD',
      theme: data.theme,
      primaryColor: data.primaryColor,
    } as Store;
  } catch (error) {
    console.error('[public-catalog] Error fetching store:', error);
    return null;
  }
}

// Get store products
export async function getStoreProducts(storeId: string): Promise<Product[]> {
  try {
    const db = getFirebaseDb();
    const productsRef = collection(db, 'stores', storeId, 'products');
    const q = query(productsRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        imageUrl: data.mediaFiles?.[0]?.url || null,
        categoryId: data.selectedCategory,
        status: data.status,
      } as Product;
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Get store categories
export async function getStoreCategories(storeId: string): Promise<Category[]> {
  try {
    const db = getFirebaseDb();
    const categoriesRef = collection(db, 'stores', storeId, 'categories');
    const snapshot = await getDocs(categoriesRef);

    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Category))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
