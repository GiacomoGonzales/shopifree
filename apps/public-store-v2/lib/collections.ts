import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export interface PublicCollection {
    id: string;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    productIds: string[];
    order: number;
    visible: boolean;
    createdAt: Date | unknown;
    updatedAt: Date | unknown;
}

/**
 * Obtiene todas las colecciones visibles de una tienda ordenadas por orden
 */
export const getStoreCollections = async (storeId: string): Promise<PublicCollection[]> => {
    try {
        const db = getFirebaseDb();
        if (!db) {
            console.warn('Database not available');
            return [];
        }

        console.log('Consultando colecciones para store:', storeId);
        
        // Obtener colecciones visibles ordenadas
        const collectionsQuery = query(
            collection(db, 'stores', storeId, 'collections'),
            where('visible', '==', true),
            orderBy('order', 'asc')
        );
        
        const collectionsSnapshot = await getDocs(collectionsQuery);
        console.log('Colecciones encontradas:', collectionsSnapshot.size);
        
        const collections: PublicCollection[] = [];
        
        collectionsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log('Colección:', doc.id, data);
            collections.push({
                id: doc.id,
                ...data
            } as PublicCollection);
        });
        
        console.log('Todas las colecciones ordenadas:', collections);
        return collections;
    } catch (error) {
        console.error('Error getting collections:', error);
        return [];
    }
};

/**
 * Obtiene una colección específica por slug
 */
export const getCollectionBySlug = async (storeId: string, slug: string): Promise<PublicCollection | null> => {
    try {
        const db = getFirebaseDb();
        if (!db) {
            console.warn('Database not available');
            return null;
        }

        console.log('Consultando colección por slug:', slug, 'para store:', storeId);
        
        // Obtener colecciones visibles que coincidan con el slug
        const collectionsQuery = query(
            collection(db, 'stores', storeId, 'collections'),
            where('visible', '==', true),
            where('slug', '==', slug)
        );
        
        const collectionsSnapshot = await getDocs(collectionsQuery);
        console.log('Colecciones encontradas por slug:', collectionsSnapshot.size);
        
        if (collectionsSnapshot.empty) {
            console.log('No se encontró colección con slug:', slug);
            return null;
        }
        
        const doc = collectionsSnapshot.docs[0];
        const data = doc.data();
        console.log('Colección encontrada:', doc.id, data);
        
        return {
            id: doc.id,
            ...data
        } as PublicCollection;
    } catch (error) {
        console.error('Error getting collection by slug:', error);
        return null;
    }
};

/**
 * Determina el tamaño de card para el mosaico dinámico
 */
export const getCollectionCardSize = (index: number, total: number): 'normal' | 'wide' | 'tall' | 'large' => {
    // Caso específico para 4 colecciones: NOVEDADES grande, OFERTAS y TOP normales, ROMA horizontal
    if (total === 4) {
        if (index === 0) return 'large';   // NOVEDADES - grande (2x2)
        if (index === 3) return 'wide';    // ROMA - horizontal (2x1) para llenar el espacio
        return 'normal';                   // OFERTAS y TOP - normales (1x1)
    }
    
    // Caso específico para 5 colecciones: una grande (2x2) y cuatro normales (1x1) sin rectangulares
    if (total === 5) {
        if (index === 0) return 'large';   // Primera - grande (2x2) ocupa mitad izquierda
        return 'normal';                   // Las otras 4 - normales (1x1) llenan los 4 espacios del costado
    }
    
    // Algoritmo dinámico para otros casos
    if (index === 0 && total > 5) return 'large';      // Primera siempre grande
    if (index === 1 && total > 6) return 'wide';       // Segunda horizontal
    if (index === 2 && total > 7) return 'tall';       // Tercera vertical
    if ((index + 1) % 6 === 0) return 'wide';          // Cada 6ta horizontal
    if ((index + 1) % 8 === 0) return 'tall';          // Cada 8va vertical
    if ((index + 1) % 10 === 0) return 'large';        // Cada 10ma grande
    return 'normal';                                     // Resto normales
};
