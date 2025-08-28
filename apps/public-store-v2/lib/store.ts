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
    primaryColor?: string;
    secondaryColor?: string;
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
            primaryColor: data.primaryColor || undefined,
            secondaryColor: data.secondaryColor || undefined,
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

export type StoreLocalDeliveryConfig = {
    enabled?: boolean;
    allowGPS?: boolean;
    noCoverageMessage?: string;
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
        console.log(`🚚 [Store] Raw Firestore data for ${storeId}:`, data);
        
        // Obtener configuración de shipping desde advanced.shipping
        const shippingConfig = data.advanced?.shipping || {};
        console.log(`🚚 [Store] Shipping config from advanced:`, shippingConfig);
        
        return {
            storePickup: shippingConfig.storePickup || { enabled: false },
            localDelivery: {
                enabled: shippingConfig.localDelivery?.enabled || false,
                allowGPS: shippingConfig.localDelivery?.allowGPS || false,
                noCoverageMessage: shippingConfig.localDelivery?.noCoverageMessage || "Lo sentimos, no hacemos entregas en tu zona"
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
                acceptOnlinePayment: advanced.payments?.acceptOnlinePayment || false
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

// Función para aplicar colores dinámicos de la tienda al tema
export function applyStoreColors(primaryColor: string, secondaryColor?: string): void {
  if (typeof document === 'undefined') return; // SSR safety
  
  // Aplicar color primario como color de éxito (newsletters, botones, etc.)
  if (primaryColor) {
    console.log(`🎨 Applying primary color: ${primaryColor}`);
    
    // Generar variaciones del color primario
    const lighterColor = lightenColor(primaryColor, 0.1);
    const darkerColor = darkenColor(primaryColor, 0.2);
    const muchDarkerColor = darkenColor(primaryColor, 0.4);
    
    // Aplicar el color primario y sus variaciones
    document.documentElement.style.setProperty('--nbd-success', primaryColor);
    document.documentElement.style.setProperty('--nbd-success-light', lighterColor);
    document.documentElement.style.setProperty('--nbd-success-dark', darkerColor);
    document.documentElement.style.setProperty('--nbd-success-darker', muchDarkerColor);
    
    // SOLUCIÓN DEFINITIVA: Aplicar gradiente directamente al ícono del newsletter
    const newsletterIcon = document.querySelector('.nbd-newsletter-icon') as HTMLElement;
    if (newsletterIcon) {
      const dynamicGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      newsletterIcon.style.background = dynamicGradient;
      console.log(`🎯 Applied direct gradient to newsletter icon: ${dynamicGradient}`);
    }
    
    // TAMBIÉN aplicar DEGRADADO dinámico al botón de suscribirse (igual que el ícono)
    const newsletterButton = document.querySelector('.nbd-newsletter-submit') as HTMLElement;
    if (newsletterButton) {
      const dynamicButtonGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      newsletterButton.style.background = dynamicButtonGradient;
      console.log(`🎯 Applied dynamic gradient to newsletter button: ${dynamicButtonGradient}`);
      
      // Aplicar hover gradient también (más oscuro)
      const hoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
      newsletterButton.addEventListener('mouseenter', () => {
        newsletterButton.style.background = hoverGradient;
      });
      newsletterButton.addEventListener('mouseleave', () => {
        newsletterButton.style.background = dynamicButtonGradient;
      });
      console.log(`🎯 Applied hover gradient to newsletter button: ${hoverGradient}`);
    }
    
    // APLICAR color dinámico a todos los botones de agregar al carrito (existentes)
    const addToCartButtons = document.querySelectorAll('.nbd-add-to-cart--loading') as NodeListOf<HTMLElement>;
    addToCartButtons.forEach(button => {
      button.style.backgroundColor = primaryColor;
    });
    
    // Observer para detectar cambios de clase en botones existentes
    const classObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains('nbd-add-to-cart--loading')) {
            // Se acaba de agregar la clase loading - aplicar color INMEDIATAMENTE
            target.style.setProperty('background-color', primaryColor, 'important');
            target.style.setProperty('transition', 'none', 'important'); // Sin transición para evitar el verde
            
            // Restaurar transición después de un frame para futuras interacciones
            setTimeout(() => {
              target.style.removeProperty('transition');
            }, 0);
            
            console.log('🎯 Applied IMMEDIATE color to cart button:', primaryColor);
          }
        }
      });
    });
    
    // También escuchar para botones que se crean dinámicamente
    const nodeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Buscar botones de carrito en el elemento agregado
            const cartButtons = element.querySelectorAll?.('.nbd-add-to-cart') as NodeListOf<HTMLElement>;
            cartButtons?.forEach(button => {
              // Observar cambios de clase en cada botón
              classObserver.observe(button, { attributes: true, attributeFilter: ['class'] });
            });
            
            // También aplicar color si ya tiene la clase loading
            const loadingButtons = element.querySelectorAll?.('.nbd-add-to-cart--loading') as NodeListOf<HTMLElement>;
            loadingButtons?.forEach(button => {
              button.style.backgroundColor = primaryColor;
            });
          }
        });
      });
    });
    
    // Observar todos los botones existentes para cambios de clase
    const existingCartButtons = document.querySelectorAll('.nbd-add-to-cart') as NodeListOf<HTMLElement>;
    existingCartButtons.forEach(button => {
      classObserver.observe(button, { attributes: true, attributeFilter: ['class'] });
    });
    
    nodeObserver.observe(document.body, { childList: true, subtree: true });
    console.log(`🎯 Applied dynamic color system to add-to-cart buttons: ${primaryColor}`);
    
    // Forzar repaint para asegurar que los cambios se apliquen
    document.documentElement.offsetHeight;
    
    console.log(`✅ Primary color applied successfully: ${primaryColor}`);
    console.log(`✅ Light variant applied: ${lighterColor}`);
    console.log(`✅ Dark variant applied: ${darkerColor}`);
    console.log(`✅ Darker variant applied: ${muchDarkerColor}`);
  }
  
  // Aplicar color secundario si está disponible
  if (secondaryColor) {
    document.documentElement.style.setProperty('--nbd-secondary-custom', secondaryColor);
    console.log(`🎨 Applied secondary color: ${secondaryColor}`);
  }
}

// Función auxiliar para oscurecer un color
function darkenColor(color: string, amount: number): string {
  // Si el color viene en formato hex
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const darkenedR = Math.floor(r * (1 - amount));
    const darkenedG = Math.floor(g * (1 - amount));
    const darkenedB = Math.floor(b * (1 - amount));
    
    return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
  }
  
  // Si no es hex, devolver el color original
  return color;
}

// Función auxiliar para aclarar un color
function lightenColor(color: string, amount: number): string {
  // Si el color viene en formato hex
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const lightenedR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const lightenedG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const lightenedB = Math.min(255, Math.floor(b + (255 - b) * amount));
    
    return `#${lightenedR.toString(16).padStart(2, '0')}${lightenedG.toString(16).padStart(2, '0')}${lightenedB.toString(16).padStart(2, '0')}`;
  }
  
  // Si no es hex, devolver el color original
  return color;
}


