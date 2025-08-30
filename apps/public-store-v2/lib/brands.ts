import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type PublicBrand = {
    id: string;
    name: string;
    description?: string;
    image?: string;
    order?: number;
    slug?: string;
};

export async function getStoreBrands(storeId: string): Promise<PublicBrand[]> {
    try {
        const db = getFirebaseDb();
        if (!db) return [];
        const ref = collection(db, "stores", storeId, "brands");
        const snap = await getDocs(query(ref, orderBy("order", "asc")));
        const items: PublicBrand[] = [];
        snap.forEach((doc) => {
            const d = doc.data() as any;
            items.push({ 
                id: doc.id, 
                name: d.name || "", 
                description: d.description, 
                image: d.image, 
                order: d.order,
                slug: d.slug || d.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || doc.id
            });
        });
        return items;
    } catch (e) {
        console.warn("[public-store-v2] getStoreBrands fallo", e);
        return [];
    }
}

/**
 * Obtiene una marca específica por su slug
 */
export const getBrandBySlug = async (storeId: string, slug: string): Promise<PublicBrand | null> => {
    try {
        const db = getFirebaseDb();
        if (!db) return null;

        console.log('Consultando marca para store:', storeId, 'slug:', slug);

        // Obtener marcas y buscar por slug
        const brandsQuery = query(
            collection(db, 'stores', storeId, 'brands')
        );

        const brandsSnapshot = await getDocs(brandsQuery);
        console.log('Marcas encontradas:', brandsSnapshot.size);

        let foundBrand: PublicBrand | null = null;

        brandsSnapshot.docs.forEach(doc => {
            const data = doc.data() as any;
            const brandSlug = data.slug || data.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || doc.id;
            
            console.log('Comparando slugs:', { searchSlug: slug, brandSlug, brandName: data.name, docId: doc.id });
            
            if (brandSlug === slug) {
                foundBrand = {
                    id: doc.id,
                    name: data.name || "",
                    description: data.description,
                    image: data.image,
                    order: data.order,
                    slug: brandSlug
                } as PublicBrand;
                console.log('¡Marca encontrada!', foundBrand);
            }
        });

        console.log('Marca encontrada por slug:', foundBrand);
        return foundBrand;
    } catch (error) {
        console.error('Error getting brand by slug:', error);
        return null;
    }
};


