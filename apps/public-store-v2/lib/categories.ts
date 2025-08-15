"use client";

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
		const ref = collection(db, "stores", storeId, "categories");
		const snap = await getDocs(query(ref, orderBy("order", "asc")));
		const items: Category[] = [];
		snap.forEach((doc) => {
			const data = doc.data() as any;
			items.push({ id: doc.id, ...data });
		});
		items.sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999));
		return items;
	} catch (e) {
		console.warn("[public-store-v2] getStoreCategories fallo", e);
		return [];
	}
}


