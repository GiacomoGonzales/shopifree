import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { doc, getDoc } from 'firebase/firestore';

// 🚀 OPTIMIZACIÓN FASE 2: Cache en memoria para storeId
// Evita hacer queries repetidas para el mismo subdomain
const storeIdCache = new Map<string, { id: string | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

export async function getStoreIdBySubdomain(subdomain: string): Promise<string | null> {
	try {
		// Verificar si existe en cache y no ha expirado
		const cached = storeIdCache.get(subdomain);
		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			console.log(`✅ [Cache HIT] storeId for ${subdomain}: ${cached.id}`);
			return cached.id;
		}

		console.log(`❌ [Cache MISS] Fetching storeId for ${subdomain} from Firestore`);
		const db = getFirebaseDb();
		if (!db) return null;
		const storesRef = collection(db, "stores");
		let q = query(storesRef, where("subdomain", "==", subdomain));
		let snap = await getDocs(q);
		if (snap.empty) {
			q = query(storesRef, where("slug", "==", subdomain));
			snap = await getDocs(q);
		}

		const storeId = snap.empty ? null : snap.docs[0].id;

		// Guardar en cache
		storeIdCache.set(subdomain, {
			id: storeId,
			timestamp: Date.now()
		});

		return storeId;
	} catch (e) {
		console.warn("[public-store-v2] getStoreIdBySubdomain fallo", e);
		return null;
	}
}

export type StoreBasicInfo = {
    id?: string; // Agregar ID para facilitar el manejo
    ownerId?: string; // ID del usuario dueño de la tienda
    storeName: string;
    slogan?: string; // Slogan de la tienda
    description?: string;
    heroImageUrl?: string;
    heroMediaUrl?: string;
    heroMediaType?: 'image' | 'video';
    logoUrl?: string;
    storefrontImageUrl?: string;
    currency?: string;
    emailStore?: string;
    phone?: string;
    address?: string;
    hasPhysicalLocation?: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    };
    language?: 'es' | 'en' | 'pt';
    theme?: string;
    primaryColor?: string;
    secondaryColor?: string;
    carouselImages?: Array<{
        url: string;
        publicId: string;
        order: number;
        link: string | null;
    }>;
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        tiktok?: string;
        whatsapp?: string;
        youtube?: string;
        twitter?: string;
        x?: string;
    };
    sections?: StoreSectionsConfig;
    announcementBar?: {
        enabled: boolean;
        message: string;
        backgroundColor: string;
        textColor: string;
        link?: string;
        linkText?: string;
        animation: 'none' | 'slide' | 'fade' | 'bounce';
        animationSpeed: 'slow' | 'normal' | 'fast';
        startDate?: string;
        endDate?: string;
        showOnMobile: boolean;
        showOnDesktop: boolean;
        position: 'top' | 'bottom';
    };
};

export type SectionConfig = {
    enabled: boolean;
    order: number;
};

export type StoreSectionsConfig = {
    hero?: SectionConfig;
    categories?: SectionConfig;
    collections?: SectionConfig;
    carousel?: SectionConfig;
    newsletter?: SectionConfig;
    brands?: SectionConfig;
    // products section is always enabled and has fixed order
};

export const DEFAULT_SECTIONS_CONFIG: StoreSectionsConfig = {
    hero: { enabled: true, order: 1 },
    categories: { enabled: true, order: 2 },
    collections: { enabled: false, order: 3 },
    carousel: { enabled: true, order: 4 },
    newsletter: { enabled: false, order: 5 },
    brands: { enabled: false, order: 6 }
};

export type StoreCheckoutConfig = {
    method: 'whatsapp' | 'traditional';
    whatsappMessage?: string;
};

export type MercadoPagoConfig = {
    enabled: boolean;
    publicKey: string;
    accessToken: string;
    environment: 'sandbox' | 'production';
    webhookUrl?: string;
    connected?: boolean; // Estado de conexión del dashboard
};

export type CulqiConfig = {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
    environment: 'test' | 'live';
    webhookUrl?: string;
    connected?: boolean; // Estado de conexión del dashboard
};

export type StorePaymentsConfig = {
    acceptCashOnDelivery?: boolean;
    cashOnDeliveryMethods?: string[];
    acceptOnlinePayment?: boolean;
    mercadopago?: MercadoPagoConfig;
    culqi?: CulqiConfig;
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
            whatsapp: data.whatsapp || data.phone || undefined,
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
            id: storeId, // Incluir el ID
            ownerId: data.ownerId || undefined, // ID del usuario dueño
            storeName: data.storeName || data.name || "",
            slogan: data.slogan || undefined,
            description: data.description || undefined,
            heroImageUrl: data.heroImageUrl || data.headerImageUrl || data.logoUrl || undefined,
            heroMediaUrl: data.heroMediaUrl || undefined,
            heroMediaType: data.heroMediaType || undefined,
            logoUrl: data.logoUrl || data.headerLogoUrl || undefined,
            storefrontImageUrl: data.storefrontImageUrl || undefined,
            currency: data.currency || data.currencyCode || undefined,
            emailStore: data.emailStore || data.email || undefined,
            phone: data.phone || data.phoneNumber || undefined,
            address: data.address || data.direction || data.direccion || undefined,
            hasPhysicalLocation: data.hasPhysicalLocation || false,
            location: data.location ? {
                address: data.location.address || "",
                lat: data.location.lat || 0,
                lng: data.location.lng || 0
            } : undefined,
            language: (data?.advanced?.language === 'en' ? 'en' :
                    data?.advanced?.language === 'pt' ? 'pt' :
                    data?.advanced?.language === 'es' ? 'es' : undefined),
            theme: data.theme || 'new-base-default',
            primaryColor: data.primaryColor || undefined,
            secondaryColor: data.secondaryColor || undefined,
            carouselImages: data.carouselImages || undefined,
            socialMedia: socialFromGroup,
            sections: data.sections || undefined,
            announcementBar: data.announcementBar || undefined,
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

export type StoreLocalDeliveryConfig = {
    enabled?: boolean;
    allowGPS?: boolean;
    noCoverageMessage?: string;
    estimatedTime?: string;
    express?: {
        enabled: boolean;
        priceMultiplier?: number;
        fixedSurcharge?: number;
        estimatedTime?: string;
    };
};

export type StoreShippingConfig = {
    storePickup?: StorePickupConfig;
    localDelivery?: StoreLocalDeliveryConfig;
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
        
        // Obtener configuración de shipping desde advanced.shipping
        const shippingConfig = data.advanced?.shipping || {};
        
        return {
            storePickup: shippingConfig.storePickup || { enabled: false },
            localDelivery: {
                enabled: shippingConfig.localDelivery?.enabled || false,
                allowGPS: shippingConfig.localDelivery?.allowGPS || false,
                noCoverageMessage: shippingConfig.localDelivery?.noCoverageMessage || "Lo sentimos, no hacemos entregas en tu zona",
                express: shippingConfig.localDelivery?.express || {
                    enabled: false,
                    priceMultiplier: 1.5,
                    fixedSurcharge: 0,
                    estimatedTime: '1-2 días hábiles'
                }
            }
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
                acceptOnlinePayment: advanced.payments?.acceptOnlinePayment || false,
                mercadopago: advanced.payments?.provider === 'mercadopago' &&
                            advanced.payments?.publicKey &&
                            advanced.payments?.secretKey ? {
                    enabled: true, // Si tienes credenciales, está habilitado
                    publicKey: advanced.payments.publicKey,
                    accessToken: advanced.payments.secretKey, // Dashboard usa 'secretKey'
                    environment: advanced.payments.publicKey.includes('test') || advanced.payments.publicKey.includes('TEST')
                               ? 'sandbox' : 'production',
                    webhookUrl: advanced.payments.webhookEndpoint || undefined,
                    connected: advanced.payments?.connected || false // Info adicional para dashboard
                } : undefined,
                culqi: advanced.payments?.provider === 'culqi' &&
                       advanced.payments?.publicKey &&
                       advanced.payments?.secretKey ? {
                    enabled: true, // Si tienes credenciales, está habilitado
                    publicKey: advanced.payments.publicKey,
                    secretKey: advanced.payments.secretKey,
                    environment: advanced.payments.publicKey.includes('test') || advanced.payments.publicKey.includes('pk_test')
                               ? 'test' : 'live',
                    webhookUrl: advanced.payments.webhookEndpoint || undefined,
                    connected: advanced.payments?.connected || false // Info adicional para dashboard
                } : undefined
            }
        } as StoreAdvancedConfig;
    } catch (e) {
        console.warn("[public-store-v2] getStoreCheckoutConfig failed", e);
        return null;
    }
}

// Función para obtener la textura de fondo de una tienda
export async function getStoreBackgroundTexture(storeId: string): Promise<string | null> {
  try {
    const db = getFirebaseDb();
    if (!db) return null;
    const storeDoc = await getDoc(doc(db, 'stores', storeId));
    return storeDoc.data()?.backgroundTexture || null;
  } catch (error) {
    console.error('Error getting background texture:', error);
    return null;
  }
}

// 🚀 OPTIMIZACIÓN FASE 2: Code Splitting
// La función applyStoreColors ahora se encuentra en store-colors.ts para reducir el bundle inicial
// Se importa dinámicamente solo cuando se necesita
export { applyStoreColors } from './store-colors';

// ✅ LIMPIADO: Todo el código deprecated ha sido eliminado
// Las funciones de colores ahora están en store-colors.ts

/**
 * Get store info by subdomain
 */
export async function getStoreInfoBySubdomain(subdomain: string): Promise<StoreBasicInfo | null> {
    try {
        // Primero obtener el storeId por subdomain
        const storeId = await getStoreIdBySubdomain(subdomain);
        if (!storeId) return null;
        
        // Luego obtener la información básica de la tienda
        return await getStoreBasicInfo(storeId);
    } catch (e) {
        console.warn("[public-store-v2] getStoreInfoBySubdomain fallo", e);
        return null;
    }
}

/**
 * Get store info by custom domain
 */
export async function getStoreInfoByDomain(domain: string): Promise<StoreBasicInfo | null> {
    try {
        const db = getFirebaseDb();
        if (!db) return null;
        
        const storesRef = collection(db, "stores");
        const q = query(storesRef, where("customDomain", "==", domain));
        const snap = await getDocs(q);
        
        if (snap.empty) return null;
        
        const storeDoc = snap.docs[0];
        const storeId = storeDoc.id;
        
        // Obtener la información básica de la tienda
        return await getStoreBasicInfo(storeId);
    } catch (e) {
        console.warn("[public-store-v2] getStoreInfoByDomain fallo", e);
        return null;
    }
}

