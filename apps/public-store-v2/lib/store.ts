import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { doc, getDoc } from 'firebase/firestore';

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
    language?: 'es' | 'en' | 'pt';
    theme?: string;
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

export type StoreCheckoutConfig = {
    method: 'whatsapp' | 'traditional';
    whatsappMessage?: string;
};

export type StorePaymentsConfig = {
    acceptCashOnDelivery?: boolean;
    cashOnDeliveryMethods?: string[];
    acceptOnlinePayment?: boolean;
};

export type StoreAdvancedConfig = {
    checkout?: StoreCheckoutConfig;
    payments?: StorePaymentsConfig;
};

export async function getStoreTheme(storeId: string): Promise<string> {
	try {
		const db = getFirebaseDb();
		        if (!db) return 'new-base-default';
		const { doc, getDoc } = await import("firebase/firestore");
		const ref = doc(db, "stores", storeId);
		const snap = await getDoc(ref);
		        if (!snap.exists()) return 'new-base-default';
        const data: any = snap.data();
        return data.theme || 'new-base-default';
    } catch (e) {
        console.warn("[public-store-v2] getStoreTheme fallo", e);
        return 'new-base-default';
	}
}

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
            language: (data?.advanced?.language === 'en' ? 'en' : 
                    data?.advanced?.language === 'pt' ? 'pt' : 
                    data?.advanced?.language === 'es' ? 'es' : undefined),
            theme: data.theme || 'new-base-default',
            socialMedia: socialFromGroup,
        };
	} catch (e) {
		console.warn("[public-store-v2] getStoreBasicInfo fallo", e);
		return null;
	}
}

/**
 * Helper functions for single locale URLs feature
 */

export type ValidLocale = 'es' | 'en' | 'pt';

/**
 * Gets the primary locale for a store from its configuration
 * Falls back to 'es' if not configured
 */
export function getPrimaryLocale(storeData: any): ValidLocale {
    // Check advanced.language field
    const language = storeData?.advanced?.language;
    
    // Normalize and validate
    if (language === 'en') return 'en';
    if (language === 'pt') return 'pt';
    return 'es'; // Default fallback
}



/**
 * Get store primary locale
 * Used in middleware and SSR functions
 */
export async function getStorePrimaryLocale(storeId: string): Promise<ValidLocale | null> {
    // 🧪 MODO DESARROLLO: Solo usar mock si no podemos conectar a Firestore
    if (process.env.NODE_ENV === 'development') {
        // Intentar conectar a Firestore primero
        try {
            const db = getFirebaseDb();
            if (db && storeId && storeId !== 'mock-tiendaverde' && storeId !== 'mock-english-store') {
                // Intentar leer configuración real de Firestore
                const docRef = doc(db, 'stores', storeId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const language = data?.advanced?.language || 'es';
                    
                    console.log(`🔗 [Firestore] Store ${storeId}: advanced.language=${language}`);
                    
                    return language as ValidLocale;
                }
            }
        } catch (error) {
            console.log(`⚠️ [Firestore] No se pudo conectar, usando mock: ${error}`);
        }
        
        // Fallback a mock solo si Firestore falla
        if (storeId === 'mock-tiendaverde') {
            return 'es';
        }
        if (storeId === 'mock-english-store') {
            return 'en';
        }
    }

    try {
        const db = getFirebaseDb();
        if (!db) return null;
        
        const { doc, getDoc } = await import("firebase/firestore");
        const ref = doc(db, "stores", storeId);
        const snap = await getDoc(ref);
        
        if (!snap.exists()) return null;
        
        const data = snap.data();
        
        return getPrimaryLocale(data);
    } catch (e) {
        console.warn("[public-store-v2] getStorePrimaryLocale fallo", e);
        return null;
    }
}

/**
 * Shipping configuration types
 */
export type StorePickupLocation = {
    id: string;
    name: string;
    address: string;
    schedules: Array<{
        day: string;
        openTime: string;
        closeTime: string;
    }>;
    preparationTime: string;
};

export type StorePickupConfig = {
    enabled: boolean;
    locations?: StorePickupLocation[];
    // Legacy fields for backward compatibility
    address?: string;
    preparationTime?: string;
    schedules?: Array<{
        day: string;
        startTime: string;
        endTime: string;
    }>;
};

export type StoreShippingConfig = {
    storePickup?: StorePickupConfig;
};

/**
 * Get store shipping configuration from Firestore
 */
export async function getStoreShippingConfig(storeId: string): Promise<StoreShippingConfig | null> {
    try {
        const db = getFirebaseDb();
        if (!db) return null;
        
        const { doc, getDoc } = await import("firebase/firestore");
        const ref = doc(db, "stores", storeId);
        const snap = await getDoc(ref);
        
        if (!snap.exists()) return null;
        
        const data = snap.data();
        console.log(`🚚 [Store] Raw Firestore data for ${storeId}:`, data);
        
        // Obtener configuración de shipping desde advanced.shipping
        const shippingConfig = data.advanced?.shipping || {};
        console.log(`🚚 [Store] Shipping config from advanced:`, shippingConfig);
        
        return {
            storePickup: shippingConfig.storePickup || { enabled: false }
        } as StoreShippingConfig;
    } catch (e) {
        console.warn("[public-store-v2] getStoreShippingConfig failed", e);
        return null;
    }
}

/**
 * Get store checkout configuration from Firestore
 */
export async function getStoreCheckoutConfig(storeId: string): Promise<StoreAdvancedConfig | null> {
    try {
        const db = getFirebaseDb();
        if (!db) return null;
        
        const { doc, getDoc } = await import("firebase/firestore");
        const ref = doc(db, "stores", storeId);
        const snap = await getDoc(ref);
        
        if (!snap.exists()) return null;
        
        const data = snap.data();
        
        // Obtener configuración avanzada
        const advanced = data.advanced || {};
        
        return {
            checkout: {
                method: advanced.checkout?.method || 'whatsapp',
                whatsappMessage: advanced.checkout?.whatsappMessage
            },
            payments: {
                acceptCashOnDelivery: advanced.payments?.acceptCashOnDelivery || false,
                cashOnDeliveryMethods: advanced.payments?.cashOnDeliveryMethods || [],
                acceptOnlinePayment: advanced.payments?.acceptOnlinePayment || false
            }
        } as StoreAdvancedConfig;
    } catch (e) {
        console.warn("[public-store-v2] getStoreCheckoutConfig failed", e);
        return null;
    }
}


