"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type PublicMediaFile = { id?: string; url: string; type?: "image" | "video" };

export type PublicProduct = {
	id: string;
	name: string;
	description?: string;
	price: number;
	comparePrice?: number | null;
	image?: string;
	video?: string;
	mediaFiles?: PublicMediaFile[];
	currency?: string;
	status?: "draft" | "active" | "archived";
};

function transformToPublicProduct(raw: any): PublicProduct {
	const mediaFiles: PublicMediaFile[] = Array.isArray(raw.mediaFiles) ? raw.mediaFiles : [];
	const firstImage = mediaFiles.find((m) => (m.type === "image") || /\.(png|jpe?g|webp|gif)$/i.test(m.url || ""));
	const firstVideo = mediaFiles.find((m) => m.type === "video" || /\.(mp4|webm|ogg)$/i.test(m.url || "") || (m.url || "").includes("/video/upload/"));

	return {
		id: String(raw.id ?? ""),
		name: String(raw.name ?? raw.title ?? "Producto"),
		description: typeof raw.description === "string" ? raw.description : "",
		price: Number(raw.price ?? 0),
		comparePrice: raw.comparePrice ?? null,
		image: raw.image ?? raw.thumbnail ?? firstImage?.url ?? raw.mediaFiles?.[0]?.url ?? undefined,
		video: raw.video ?? firstVideo?.url ?? undefined,
		mediaFiles,
		currency: raw.currency ?? "USD",
		status: raw.status ?? "active",
	};
}

export async function getStoreProducts(storeId: string): Promise<PublicProduct[]> {
	try {
		const db = getFirebaseDb();
		if (!db) return [];
		const ref = collection(db, "stores", storeId, "products");
		let snap;
		try {
			snap = await getDocs(query(ref, where("status", "==", "active")));
		} catch {
			snap = await getDocs(ref);
		}
		const items: PublicProduct[] = [];
		snap.forEach((doc) => {
			const data = { id: doc.id, ...doc.data() } as any;
			const p = transformToPublicProduct(data);
			if (p.status === "active") items.push(p);
		});
		return items;
	} catch (e) {
		console.warn("[public-store-v2] getStoreProducts fallo", e);
		return [];
	}
}


