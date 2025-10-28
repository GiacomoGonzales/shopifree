import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type PublicMediaFile = { id?: string; url: string; type?: "image" | "video" };

export type ModifierOption = {
	id: string;
	name: string;
	priceModifier: number;
	isDefault: boolean;
	isActive: boolean;
	order: number;
};

export type ModifierGroup = {
	id: string;
	name: string;
	required: boolean;
	allowMultiple: boolean;
	minSelections: number;
	maxSelections: number;
	order: number;
	options: ModifierOption[];
};

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
    selectedSubcategoryIds?: string[];
    brand?: string;
    selectedBrandId?: string;
    tags?: Record<string, any>;        // Solo para variantes reales
    metadata?: Record<string, any>;    // Para metadatos descriptivos (color, material, etc.)
    modifierGroups?: ModifierGroup[];  // Modificadores y extras
    createdAt?: string;
};

/**
 * Resolver referencias de modificadores a sus datos completos
 * Compatible con formato antiguo (datos copiados) y nuevo (referencias)
 */
async function resolveModifierReferences(
	storeId: string,
	modifierGroups: any[]
): Promise<ModifierGroup[]> {
	if (!modifierGroups || modifierGroups.length === 0) return []

	const db = getFirebaseDb()
	if (!db) return []

	const resolved = await Promise.all(
		modifierGroups.map(async (group) => {
			// Formato nuevo: tiene templateId
			if (group.templateId) {
				try {
					const templateRef = doc(db, 'stores', storeId, 'modifierTemplates', group.templateId)
					const templateSnap = await getDoc(templateRef)

					if (!templateSnap.exists()) {
						console.warn(`Template ${group.templateId} not found, skipping modifier group`)
						return null
					}

					const template = templateSnap.data()
					return {
						id: templateSnap.id,
						name: template.name,
						required: template.required,
						allowMultiple: template.allowMultiple,
						minSelections: template.minSelections,
						maxSelections: template.maxSelections,
						options: template.options,
						order: group.order ?? 0
					}
				} catch (error) {
					console.error(`Error resolving template ${group.templateId}:`, error)
					return null
				}
			}

			// Formato nuevo: tiene customData
			if (group.customData) {
				return {
					id: group.customData.id,
					name: group.customData.name,
					required: group.customData.required,
					allowMultiple: group.customData.allowMultiple,
					minSelections: group.customData.minSelections,
					maxSelections: group.customData.maxSelections,
					options: group.customData.options,
					order: group.order ?? 0
				}
			}

			// Formato antiguo: datos directamente en el grupo (compatibilidad)
			if (group.name && group.options) {
				return group
			}

			return null
		})
	)

	return resolved.filter((g): g is ModifierGroup => g !== null).sort((a, b) => a.order - b.order)
}

function transformToPublicProduct(raw: any): PublicProduct {
	const mediaFiles: PublicMediaFile[] = Array.isArray(raw.mediaFiles) ? raw.mediaFiles : [];
	const firstImage = mediaFiles.find((m) => (m.type === "image") || /\.(png|jpe?g|webp|gif)$/i.test(m.url || ""));
	const firstVideo = mediaFiles.find((m) => m.type === "video" || /\.(mp4|webm|ogg)$/i.test(m.url || "") || (m.url || "").includes("/video/upload/"));

	// Usar urlSlug de Firestore o generar uno si no existe
	const productName = String(raw.name ?? raw.title ?? "Producto");
	let productSlug = typeof raw.urlSlug === 'string' && raw.urlSlug.trim() !== '' ? raw.urlSlug : undefined;
	
	// Si no hay urlSlug, generar uno a partir del nombre (fallback)
	if (!productSlug && productName && productName !== "Producto") {
		productSlug = productName
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '') // remover acentos
			.replace(/[^a-z0-9\s-]/g, '') // solo letras, números, espacios y guiones
			.trim()
			.replace(/\s+/g, '-') // espacios a guiones
			.replace(/-+/g, '-') // múltiples guiones a uno solo
			.replace(/^-|-$/g, ''); // remover guiones al inicio/final
		
		// Si después de todo eso queda vacío, usar el ID
		if (!productSlug) {
			productSlug = `producto-${raw.id}`;
		}
	}

	return {
		id: String(raw.id ?? ""),
		name: productName,
		description: typeof raw.description === "string" ? raw.description : "",
		price: Number(raw.price ?? 0),
		comparePrice: raw.comparePrice ?? null,
		image: raw.image ?? raw.thumbnail ?? firstImage?.url ?? raw.mediaFiles?.[0]?.url ?? undefined,
		video: raw.video ?? firstVideo?.url ?? undefined,
		mediaFiles,
		currency: raw.currency ?? "USD",
		status: raw.status ?? "active",
        slug: productSlug,
        categoryId: typeof raw.categoryId === 'string' ? raw.categoryId : 
                  Array.isArray(raw.selectedParentCategoryIds) && raw.selectedParentCategoryIds.length > 0 ? raw.selectedParentCategoryIds[0] : undefined,
        selectedParentCategoryIds: Array.isArray(raw.selectedParentCategoryIds) ? raw.selectedParentCategoryIds : undefined,
        selectedSubcategoryIds: Array.isArray(raw.selectedSubcategoryIds) ? raw.selectedSubcategoryIds : undefined,
        brand: typeof raw.brand === 'string' ? raw.brand : undefined,
        selectedBrandId: typeof raw.selectedBrandId === 'string' ? raw.selectedBrandId : undefined,
        tags: (() => {
            const tags: Record<string, any> = {};
            
            // Solo agregar variantes reales si existen
            if (raw.variants && Array.isArray(raw.variants) && raw.variants.length > 0) {
                tags.variants = raw.variants;
            }
            
            return tags;
        })(),
        
        // Separar metadatos descriptivos de las variantes de compra
        metadata: (() => {
            let metaValues = raw.metaFieldValues && typeof raw.metaFieldValues === 'object' ? raw.metaFieldValues : {};
            
            // Clean metadata values to remove prefixes like "metadata.values."
            const cleanedMetadata: Record<string, any> = {};
            Object.entries(metaValues).forEach(([key, value]) => {
                // Saltar variantes - esas van en tags.variants
                if (key === 'variants') return;
                
                if (Array.isArray(value)) {
                    const cleanedValues = value.map(v => {
                        if (typeof v === 'string' && v.startsWith('metadata.values.')) {
                            const parts = v.split('.');
                            return parts[parts.length - 1];
                        }
                        return v;
                    }).filter(v => v && !v.includes('_options.') && !v.startsWith('metadata.'));
                    
                    if (cleanedValues.length > 0) {
                        cleanedMetadata[key] = cleanedValues;
                    }
                } else if (typeof value === 'string') {
                    if (value.startsWith('metadata.values.')) {
                        const parts = value.split('.');
                        const cleanedValue = parts[parts.length - 1];
                        if (cleanedValue && !cleanedValue.includes('_options.') && !cleanedValue.startsWith('metadata.')) {
                            cleanedMetadata[key] = cleanedValue;
                        }
                    } else if (!value.includes('_options.') && !value.startsWith('metadata.')) {
                        cleanedMetadata[key] = value;
                    }
                } else {
                    cleanedMetadata[key] = value;
                }
            });
            
            return cleanedMetadata;
        })(),
        modifierGroups: Array.isArray(raw.modifierGroups) ? raw.modifierGroups : undefined,
        createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt || undefined,
	};
}

// 🚀 OPTIMIZACIÓN FASE 1: Agregar parámetro limit opcional para cargar menos productos inicialmente
export async function getStoreProducts(storeId: string, limitCount?: number): Promise<PublicProduct[]> {
	try {
		const db = getFirebaseDb();
		if (!db) {
			console.warn(`❌ [getStoreProducts] No hay conexión a Firebase`);
			return [];
		}
		const ref = collection(db, "stores", storeId, "products");
		let snap;
		try {
			// Si hay limit, usar orderBy + limit para traer solo los más recientes
			if (limitCount) {
				const { orderBy, limit } = await import("firebase/firestore");
				snap = await getDocs(
					query(
						ref,
						where("status", "==", "active"),
						orderBy("createdAt", "desc"),
						limit(limitCount)
					)
				);
			} else {
				// Sin limit, traer todos como antes
				snap = await getDocs(query(ref, where("status", "==", "active")));
			}
		} catch {
			snap = await getDocs(ref);
		}
		const items: PublicProduct[] = [];

		// Procesar productos en paralelo con resolución de modificadores
		const productPromises = snap.docs.map(async (docSnap) => {
			const data = { id: docSnap.id, ...docSnap.data() } as any;
			const p = transformToPublicProduct(data);

			// Resolver modificadores si existen
			if (p.modifierGroups && p.modifierGroups.length > 0) {
				p.modifierGroups = await resolveModifierReferences(storeId, p.modifierGroups);
			}

			return p;
		});

		const products = await Promise.all(productPromises);

		// Filtrar solo productos activos
		for (const p of products) {
			if (p.status === "active") {
				items.push(p);
			}
		}

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
        const snap = await getDocs(query(ref, where("urlSlug", "==", slug)));
        if (snap.empty) return null;
        const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
        const p = transformToPublicProduct(data);

        // Resolver modificadores si existen
        if (p.modifierGroups && p.modifierGroups.length > 0) {
            p.modifierGroups = await resolveModifierReferences(storeId, p.modifierGroups);
        }

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
        // 1) intentar por urlSlug (campo real en Firestore)
        const ref = collection(db, "stores", storeId, "products");
        const snap = await getDocs(query(ref, where("urlSlug", "==", slugOrId)));
        if (!snap.empty) {
            const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
            const p = transformToPublicProduct(data);

            // Resolver modificadores si existen
            if (p.modifierGroups && p.modifierGroups.length > 0) {
                p.modifierGroups = await resolveModifierReferences(storeId, p.modifierGroups);
            }

            const result = p.status === 'active' ? p : null;
            return result;
        }
        // 2) fallback por ID de documento
        const pRef = doc(db, "stores", storeId, "products", slugOrId);
        const pSnap = await getDoc(pRef);
        if (!pSnap.exists()) return null;
        const data = { id: pSnap.id, ...pSnap.data() } as any;
        const p = transformToPublicProduct(data);

        // Resolver modificadores si existen
        if (p.modifierGroups && p.modifierGroups.length > 0) {
            p.modifierGroups = await resolveModifierReferences(storeId, p.modifierGroups);
        }

        return p.status === 'active' ? p : null;
    } catch (e) {
        console.warn("[public-store-v2] getProduct fallo", e);
        return null;
    }
}


