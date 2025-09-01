import { getFirebaseDb } from './firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

export interface Filter {
    id: string;
    name: string;
    type: 'tags' | 'select';
    options: string[]; // Array of option values
    order?: number;
    productCount?: number;
    visible?: boolean;
}



export async function getStoreFilters(storeId: string): Promise<Filter[]> {
    try {
        const db = getFirebaseDb();
        if (!db) return [];
        
        const ref = collection(db, "stores", storeId, "filters");
        const snap = await getDocs(query(ref, orderBy("order", "asc")));
        
        const filters: Filter[] = [];
        snap.forEach((doc) => {
            const data = doc.data();
            
            // Solo incluir filtros visibles y que tengan opciones
            if (data.visible && data.options && Array.isArray(data.options) && data.options.length > 0) {
                filters.push({
                    id: doc.id,
                    name: data.name || doc.id,
                    type: data.type || 'tags',
                    options: data.options,
                    order: data.order || 0,
                    productCount: data.productCount || 0,
                    visible: data.visible
                });
            }
        });
        
        return filters;
    } catch (e) {
        console.warn("[public-store-v2] getStoreFilters fallo", e);
        return [];
    }
}
