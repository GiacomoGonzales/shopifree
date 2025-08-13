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
    currency?: string;
    emailStore?: string;
    phone?: string;
    address?: string;
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        tiktok?: string;
        whatsapp?: string;
        youtube?: string;
        twitter?: string;
        x?: string;
    };
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
        const socialFromRoot = {
            instagram: data.instagram || undefined,
            facebook: data.facebook || undefined,
            tiktok: data.tiktok || undefined,
            whatsapp: data.whatsapp || undefined,
            youtube: data.youtube || undefined,
            twitter: data.twitter || data.x || undefined,
            x: data.x || undefined,
        } as StoreBasicInfo["socialMedia"];

        const socialFromGroup = (typeof data.socialMedia === "object" && data.socialMedia) ? {
            instagram: data.socialMedia.instagram || socialFromRoot?.instagram,
            facebook: data.socialMedia.facebook || socialFromRoot?.facebook,
            tiktok: data.socialMedia.tiktok || socialFromRoot?.tiktok,
            whatsapp: data.socialMedia.whatsapp || socialFromRoot?.whatsapp,
            youtube: data.socialMedia.youtube || socialFromRoot?.youtube,
            twitter: data.socialMedia.twitter || data.socialMedia.x || socialFromRoot?.twitter,
            x: data.socialMedia.x || socialFromRoot?.x,
        } : socialFromRoot;

        return {
            storeName: data.storeName || data.name || "",
            description: data.description || data.slogan || "",
            heroImageUrl: data.heroImageUrl || data.headerImageUrl || data.logoUrl || undefined,
            logoUrl: data.logoUrl || data.headerLogoUrl || undefined,
            currency: data.currency || data.currencyCode || undefined,
            emailStore: data.emailStore || data.email || undefined,
            phone: data.phone || data.phoneNumber || undefined,
            address: data.address || data.direction || data.direccion || undefined,
            socialMedia: socialFromGroup,
        };
	} catch (e) {
		console.warn("[public-store-v2] getStoreBasicInfo fallo", e);
		return null;
	}
}


