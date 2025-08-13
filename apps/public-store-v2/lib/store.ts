"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export async function getStoreIdBySubdomain(subdomain: string): Promise<string | null> {
	try {
		const db = getFirebaseDb();
		if (!db) return null;
		const storesRef = collection(db, "stores");
		let q = query(storesRef, where("subdomain", "==", subdomain));
		let snap = await getDocs(q);
		if (snap.empty) {
			q = query(storesRef, where("slug", "==", subdomain));
			snap = await getDocs(q);
		}
		if (snap.empty) return null;
		return snap.docs[0].id;
	} catch (e) {
		console.warn("[public-store-v2] getStoreIdBySubdomain fallo", e);
		return null;
	}
}

export type StoreBasicInfo = {
    storeName: string;
    description?: string;
    heroImageUrl?: string;
    logoUrl?: string;
};

export async function getStoreBasicInfo(storeId: string): Promise<StoreBasicInfo | null> {
	try {
		const db = getFirebaseDb();
		if (!db) return null;
		const { doc, getDoc } = await import("firebase/firestore");
		const ref = doc(db, "stores", storeId);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		const data: any = snap.data();
        return {
            storeName: data.storeName || data.name || "",
            description: data.description || data.slogan || "",
            heroImageUrl: data.heroImageUrl || data.headerImageUrl || data.logoUrl || undefined,
            logoUrl: data.logoUrl || data.headerLogoUrl || undefined,
        };
	} catch (e) {
		console.warn("[public-store-v2] getStoreBasicInfo fallo", e);
		return null;
	}
}


