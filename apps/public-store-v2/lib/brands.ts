"use client";

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type PublicBrand = {
    id: string;
    name: string;
    description?: string;
    image?: string;
    order?: number;
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
            items.push({ id: doc.id, name: d.name || "", description: d.description, image: d.image, order: d.order });
        });
        return items;
    } catch (e) {
        console.warn("[public-store-v2] getStoreBrands fallo", e);
        return [];
    }
}


