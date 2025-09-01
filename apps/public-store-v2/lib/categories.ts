import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string;
	order?: number;
	storeId?: string;
	parentCategoryId?: string | null;
	imageUrl?: string;
	imagePublicId?: string;
}

export async function getStoreCategories(storeId: string): Promise<Category[]> {
	try {
		const db = getFirebaseDb();
		if (!db) return [];
		
		// Cargar categorías padre
		const ref = collection(db, "stores", storeId, "categories");
		const snap = await getDocs(query(ref, orderBy("order", "asc")));
		const items: Category[] = [];
		
		snap.forEach((doc) => {
			const data = doc.data() as any;
			items.push({ id: doc.id, ...data });
		});
		
		console.log(`🔍 Loaded ${items.length} parent categories`);
		
		// Cargar subcategorías para cada categoría padre
		for (const parentCategory of items) {
			try {
				const subcategoriesRef = collection(db, "stores", storeId, "categories", parentCategory.id, "subcategorias");
				const subcategoriesSnap = await getDocs(subcategoriesRef);
				
				subcategoriesSnap.forEach((subDoc) => {
					const subData = subDoc.data() as any;
					items.push({ 
						id: subDoc.id, 
						...subData,
						parentCategoryId: parentCategory.id // Asegurar que tiene el parentCategoryId
					});
				});
				
				console.log(`🔍 Loaded ${subcategoriesSnap.size} subcategories for "${parentCategory.name}"`);
			} catch (subError) {
				console.warn(`Failed to load subcategories for ${parentCategory.name}:`, subError);
			}
		}
		
		console.log(`🔍 Total categories loaded (including subcategories): ${items.length}`);
		
		items.sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999));
		return items;
	} catch (e) {
		console.warn("[public-store-v2] getStoreCategories fallo", e);
		return [];
	}
}


