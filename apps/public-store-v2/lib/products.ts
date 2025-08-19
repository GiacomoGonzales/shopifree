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
    slug?: string;
    categoryId?: string;
    selectedParentCategoryIds?: string[];
    brand?: string;
    tags?: Record<string, string>;
    createdAt?: string;
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
        slug: typeof raw.slug === 'string' ? raw.slug : undefined,
        categoryId: typeof raw.categoryId === 'string' ? raw.categoryId : 
                  Array.isArray(raw.selectedParentCategoryIds) && raw.selectedParentCategoryIds.length > 0 ? raw.selectedParentCategoryIds[0] : undefined,
        selectedParentCategoryIds: Array.isArray(raw.selectedParentCategoryIds) ? raw.selectedParentCategoryIds : undefined,
        brand: typeof raw.brand === 'string' ? raw.brand : undefined,
        tags: raw.metaFieldValues && typeof raw.metaFieldValues === 'object' ? raw.metaFieldValues : undefined,
        createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt || undefined,
	};
}

export async function getStoreProducts(storeId: string): Promise<PublicProduct[]> {
	try {
		console.log(`🔍 [getStoreProducts] Obteniendo productos para storeId: ${storeId}`);
		const db = getFirebaseDb();
		if (!db) {
			console.warn(`❌ [getStoreProducts] No hay conexión a Firebase`);
			return [];
		}
		const ref = collection(db, "stores", storeId, "products");
		let snap;
		try {
			snap = await getDocs(query(ref, where("status", "==", "active")));
			console.log(`📊 [getStoreProducts] Query por status=active devolvió: ${snap.size} productos`);
		} catch {
			snap = await getDocs(ref);
			console.log(`📊 [getStoreProducts] Query general devolvió: ${snap.size} productos`);
		}
		const items: PublicProduct[] = [];
		snap.forEach((doc) => {
			const data = { id: doc.id, ...doc.data() } as any;
			const p = transformToPublicProduct(data);
			console.log(`📦 [getStoreProducts] Producto procesado: ${p.name} - Status: ${p.status} - Slug: ${p.slug || 'NO_SLUG'}`);
			if (p.status === "active") {
				items.push(p);
				console.log(`✅ [getStoreProducts] Producto activo añadido: ${p.name}`);
			} else {
				console.log(`⚠️ [getStoreProducts] Producto no activo omitido: ${p.name} (status: ${p.status})`);
			}
		});
		console.log(`🎯 [getStoreProducts] Total productos activos devueltos: ${items.length}`);
		return items;
	} catch (e) {
		console.warn("[public-store-v2] getStoreProducts fallo", e);
		return [];
	}
}

export async function getProductBySlug(storeId: string, slug: string): Promise<PublicProduct | null> {
    try {
        const db = getFirebaseDb();
        if (!db) return null;
        const ref = collection(db, "stores", storeId, "products");
        const snap = await getDocs(query(ref, where("slug", "==", slug)));
        if (snap.empty) return null;
        const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
        const p = transformToPublicProduct(data);
        return p.status === 'active' ? p : null;
    } catch (e) {
        console.warn("[public-store-v2] getProductBySlug fallo", e);
        return null;
    }
}

export async function getProduct(storeId: string, slugOrId: string): Promise<PublicProduct | null> {
    try {
        const db = getFirebaseDb();
        if (!db) return null;
        // 1) intentar por slug
        const ref = collection(db, "stores", storeId, "products");
        const snap = await getDocs(query(ref, where("slug", "==", slugOrId)));
        if (!snap.empty) {
            const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
            const p = transformToPublicProduct(data);
            return p.status === 'active' ? p : null;
        }
        // 2) fallback por ID de documento
        const { doc, getDoc } = await import('firebase/firestore');
        const pRef = doc(db, "stores", storeId, "products", slugOrId);
        const pSnap = await getDoc(pRef);
        if (!pSnap.exists()) return null;
        const data = { id: pSnap.id, ...pSnap.data() } as any;
        const p = transformToPublicProduct(data);
        return p.status === 'active' ? p : null;
    } catch (e) {
        console.warn("[public-store-v2] getProduct fallo", e);
        return null;
    }
}


