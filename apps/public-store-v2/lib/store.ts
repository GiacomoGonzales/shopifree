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
    id?: string; // Agregar ID para facilitar el manejo
    storeName: string;
    description?: string;
    heroImageUrl?: string;
    heroMediaUrl?: string;
    heroMediaType?: 'image' | 'video';
    logoUrl?: string;
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

export type StorePaymentsConfig = {
    acceptCashOnDelivery?: boolean;
    cashOnDeliveryMethods?: string[];
    acceptOnlinePayment?: boolean;
    mercadopago?: MercadoPagoConfig;
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
            id: storeId, // Incluir el ID
            storeName: data.storeName || data.name || "",
            description: data.description || data.slogan || "",
            heroImageUrl: data.heroImageUrl || data.headerImageUrl || data.logoUrl || undefined,
            heroMediaUrl: data.heroMediaUrl || undefined,
            heroMediaType: data.heroMediaType || undefined,
            logoUrl: data.logoUrl || data.headerLogoUrl || undefined,
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
    
    // APLICAR VARIABLES CSS PRINCIPALES para botones, selectores de variantes, etc.
    document.documentElement.style.setProperty('--nbd-primary', primaryColor);
    document.documentElement.style.setProperty('--nbd-secondary', darkerColor);

    // CONVERTIR COLORES A RGB PARA USAR CON rgba()
    const hexToRgb = (hex: string) => {
      const cleanHex = hex.replace('#', '');
      if (cleanHex.length !== 6) return '0, 0, 0'; // fallback
      const r = parseInt(cleanHex.slice(0, 2), 16);
      const g = parseInt(cleanHex.slice(2, 4), 16);
      const b = parseInt(cleanHex.slice(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    };

    document.documentElement.style.setProperty('--nbd-primary-rgb', hexToRgb(primaryColor));
    document.documentElement.style.setProperty('--nbd-secondary-rgb', hexToRgb(darkerColor));
    console.log(`🎨 RGB values set: primary-rgb=${hexToRgb(primaryColor)}, secondary-rgb=${hexToRgb(darkerColor)}`);
    
    // APLICAR VARIABLES CSS PARA NEWSLETTER basadas en el color secundario
    if (secondaryColor) {
      const newsletterDark = darkenColor(secondaryColor, 0.4);
      const newsletterDarker = darkenColor(secondaryColor, 0.6);
      
      document.documentElement.style.setProperty('--nbd-newsletter-dark', newsletterDark);
      document.documentElement.style.setProperty('--nbd-newsletter-darker', newsletterDarker);
      console.log(`📧 Newsletter gradient colors set: dark=${newsletterDark}, darker=${newsletterDarker} (based on secondary: ${secondaryColor})`);
      
      // APLICAR VARIABLES CSS PARA CHECKOUT basadas en el color secundario
      const checkoutLight = lightenColor(secondaryColor, 0.1);
      const checkoutDark = darkenColor(secondaryColor, 0.2);
      
      document.documentElement.style.setProperty('--nbd-checkout-primary', secondaryColor);
      document.documentElement.style.setProperty('--nbd-checkout-light', checkoutLight);
      document.documentElement.style.setProperty('--nbd-checkout-dark', checkoutDark);
      console.log(`🛒 Checkout colors set: primary=${secondaryColor}, light=${checkoutLight}, dark=${checkoutDark} (based on secondary color)`);
    }
    
    console.log(`🎨 CSS Variables set: --nbd-primary=${primaryColor}, --nbd-secondary=${darkerColor}`);
    
    // APLICAR COLOR PRIMARIO DIRECTAMENTE AL DROPDOWN ACTIVO
    const applyDropdownColors = () => {
      const activeDropdownOptions = document.querySelectorAll('.nbd-dropdown-option--active') as NodeListOf<HTMLElement>;
      activeDropdownOptions.forEach(option => {
        option.style.setProperty('background', primaryColor, 'important');
        option.style.setProperty('background-color', primaryColor, 'important');
        option.style.setProperty('color', 'white', 'important');
      });
    };
    
    // Aplicar inmediatamente
    applyDropdownColors();
    
    // Detectar cuando se hace clic en el botón de ordenar para aplicar colores
    const observeDropdownClicks = () => {
      const sortButtons = document.querySelectorAll('.nbd-control-btn') as NodeListOf<HTMLElement>;
      sortButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Aplicar colores después de que se abra el dropdown
          setTimeout(applyDropdownColors, 50);
          setTimeout(applyDropdownColors, 200);
        });
      });
    };
    
    // Observer para detectar cuando aparece el dropdown
    const dropdownObserver = new MutationObserver(() => {
      applyDropdownColors();
    });
    
    // Observar cambios en el documento para detectar el dropdown
    dropdownObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Aplicar cuando se abra el dropdown
    setTimeout(applyDropdownColors, 100);
    setTimeout(applyDropdownColors, 500);
    setTimeout(observeDropdownClicks, 1000);
    
    // SOLUCIÓN MEJORADA: Aplicar estilos a selectores de variantes con limpieza previa
    const applyVariantColors = () => {
      // PRIMERO: Limpiar TODOS los estilos inline de variantes (EXCEPTO variantes con precios)
      const allVariants = document.querySelectorAll('.nbd-variant-option:not(.nbd-variant-option--pricing)') as NodeListOf<HTMLElement>;
      allVariants.forEach(variant => {
        variant.style.removeProperty('background-color');
        variant.style.removeProperty('border-color');
        variant.style.removeProperty('color');
      });
      
      // SEGUNDO: Aplicar estilos solo a elementos seleccionados (EXCEPTO variantes con precios)
      const selectedVariants = document.querySelectorAll('.nbd-variant-option--selected:not(.nbd-variant-option--pricing)') as NodeListOf<HTMLElement>;
      selectedVariants.forEach(variant => {
        variant.style.setProperty('background-color', primaryColor, 'important');
        variant.style.setProperty('border-color', primaryColor, 'important');
        variant.style.setProperty('color', 'white', 'important');
      });
      
      // Observer mejorado para nuevas selecciones (EXCEPTO variantes con precios)
      const handleVariantClick = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('nbd-variant-option') && !target.classList.contains('nbd-variant-option--pricing')) {
          // Pequeño delay para que la clase --selected se aplique primero
          setTimeout(() => {
            // Limpiar TODOS los elementos de la misma variante
            const parentGroup = target.closest('.nbd-variant-group');
            if (parentGroup) {
              const siblingVariants = parentGroup.querySelectorAll('.nbd-variant-option:not(.nbd-variant-option--pricing)') as NodeListOf<HTMLElement>;
              siblingVariants.forEach(sibling => {
                sibling.style.removeProperty('background-color');
                sibling.style.removeProperty('border-color');
                sibling.style.removeProperty('color');
              });
            }
            
            // Aplicar estilo solo al seleccionado
            if (target.classList.contains('nbd-variant-option--selected')) {
              target.style.setProperty('background-color', primaryColor, 'important');
              target.style.setProperty('border-color', primaryColor, 'important');
              target.style.setProperty('color', 'white', 'important');
                    }
          }, 10);
        }
      };
      
      // Remover listeners existentes y agregar uno nuevo
      document.removeEventListener('click', handleVariantClick);
      document.addEventListener('click', handleVariantClick);
    };
    
    // Aplicar inmediatamente y después de un delay
    applyVariantColors();
    setTimeout(applyVariantColors, 100);
    
    // APLICAR COLOR DINÁMICO A TEXTURAS DE FONDO
    const applyTextureColors = () => {
      // Usar el color secundario real de la tienda, no el calculado
      const realSecondaryColor = secondaryColor || darkerColor;
      
      // Validar que tenemos un color válido
      if (!realSecondaryColor || !realSecondaryColor.startsWith('#')) {
        return;
      }
      
      // Convertir color secundario a rgba con opacidad aumentada
      const hexToRgba = (hex: string, opacity: number) => {
        const cleanHex = hex.replace('#', '');
        if (cleanHex.length !== 6) {
          return `rgba(0, 0, 0, ${opacity})`; // fallback
        }
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      };
      
      // Crear SVGs dinámicos con el color de la tienda
      const colorHex = realSecondaryColor.replace('#', '%23');
      
      // Crear estilos dinámicos para cada textura con el color secundario
      const dynamicStyles = `
        /* Texturas con color secundario dinámico */
        .texture-subtle-dots {
          background-image: radial-gradient(circle, ${hexToRgba(realSecondaryColor, 0.04)} 1px, transparent 1px) !important;
        }
        
        .texture-geometric-grid {
          background-image: 
            linear-gradient(${hexToRgba(realSecondaryColor, 0.035)} 1px, transparent 1px),
            linear-gradient(90deg, ${hexToRgba(realSecondaryColor, 0.035)} 1px, transparent 1px) !important;
        }
        
        .texture-organic-waves {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${colorHex}' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
        }
        
        .texture-diagonal-lines {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            ${hexToRgba(realSecondaryColor, 0.025)} 8px,
            ${hexToRgba(realSecondaryColor, 0.025)} 10px
          ) !important;
        }
        
        .texture-fabric-weave {
          background-image: 
            linear-gradient(45deg, ${hexToRgba(realSecondaryColor, 0.02)} 25%, transparent 25%),
            linear-gradient(-45deg, ${hexToRgba(realSecondaryColor, 0.02)} 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, ${hexToRgba(realSecondaryColor, 0.02)} 75%),
            linear-gradient(-45deg, transparent 75%, ${hexToRgba(realSecondaryColor, 0.02)} 75%) !important;
        }
        
        .texture-hexagon-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${colorHex}' fill-opacity='0.035'%3E%3Cpath d='M20 0l15.5 9v18L20 36 4.5 27V9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
        }
        
        .texture-floating-bubbles {
          background-image: 
            radial-gradient(circle at 20% 30%, ${hexToRgba(realSecondaryColor, 0.025)} 2px, transparent 2px),
            radial-gradient(circle at 60% 70%, ${hexToRgba(realSecondaryColor, 0.035)} 3px, transparent 3px),
            radial-gradient(circle at 40% 90%, ${hexToRgba(realSecondaryColor, 0.02)} 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, ${hexToRgba(realSecondaryColor, 0.03)} 2px, transparent 2px) !important;
        }
        
        .texture-asymmetric-waves {
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${colorHex}' fill-opacity='0.025'%3E%3Cpath d='M0 40c8-12 20-8 25-2s18 8 25-2 12-18 25-15c8 2 15 12 5 20-8 6-18 2-25 8s-15 12-25 5c-8-5-12-15-5-20 5-3 12 1 15-8s-8-15-15-10c-5 3-8 12-15 8s-10-15-10-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
        }
        
        .texture-scattered-leaves {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${colorHex}' fill-opacity='0.028'%3E%3Cpath d='M15 25c3-8 12-5 8 2-2 4-8 3-8-2zm35 10c5-6 10-2 6 4-3 4-8 1-6-4zm60 15c4-7 11-3 7 3-3 4-9 2-7-3zm20 35c6-5 9 0 5 5-3 3-8 1-5-5zm45 20c3-6 8-2 5 3-2 3-7 1-5-3z'/%3E%3Cpath d='M25 60c-2 5-8 3-6-2 1-3 6-2 6 2zm70 5c-3 6-9 2-6-3 2-3 7-1 6 3zm10 25c-4 4-8 0-5-4 2-2 6-1 5 4zm55 10c-2 4-6 1-4-2 1-2 5-1 4 2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
        }
        
        .texture-paper-texture {
          background-image: 
            radial-gradient(circle at 25% 25%, ${hexToRgba(realSecondaryColor, 0.015)} 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, ${hexToRgba(realSecondaryColor, 0.02)} 0.5px, transparent 0.5px),
            linear-gradient(0deg, transparent 24%, ${hexToRgba(realSecondaryColor, 0.008)} 25%, ${hexToRgba(realSecondaryColor, 0.008)} 26%, transparent 27%, transparent 74%, ${hexToRgba(realSecondaryColor, 0.008)} 75%, ${hexToRgba(realSecondaryColor, 0.008)} 76%, transparent 77%),
            linear-gradient(90deg, transparent 24%, ${hexToRgba(realSecondaryColor, 0.008)} 25%, ${hexToRgba(realSecondaryColor, 0.008)} 26%, transparent 27%, transparent 74%, ${hexToRgba(realSecondaryColor, 0.008)} 75%, ${hexToRgba(realSecondaryColor, 0.008)} 76%, transparent 77%) !important;
        }
      `;
      
      // Aplicar estilos dinámicos
      let styleElement = document.getElementById('dynamic-texture-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-texture-styles';
        document.head.appendChild(styleElement);
      } else {
      }
      
      styleElement.textContent = dynamicStyles;
      
      // Verificar que las clases de textura existen en el DOM
      const textureElements = document.querySelectorAll('[class*="texture-"]');
      
    };
    
    // Aplicar colores de texturas con múltiples intentos
    applyTextureColors();
    setTimeout(applyTextureColors, 200);
    setTimeout(applyTextureColors, 500);
    setTimeout(applyTextureColors, 1000);
    
    // Observer para detectar cuando se aplican las clases de textura
    const textureObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          const className = target.className || '';
          if (typeof className === 'string' && className.includes('texture-')) {
            setTimeout(applyTextureColors, 50);
          }
        }
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const className = element.className || '';
              if (typeof className === 'string' && className.includes('texture-')) {
                setTimeout(applyTextureColors, 50);
              }
            }
          });
        }
      });
    });
    
    textureObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true
    });
    
    
    // SOLUCIÓN DEFINITIVA: Aplicar gradiente directamente al ícono del newsletter
    const newsletterIcon = document.querySelector('.nbd-newsletter-icon') as HTMLElement;
    if (newsletterIcon) {
      const dynamicGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      newsletterIcon.style.background = dynamicGradient;
    }
    
    // TAMBIÉN aplicar DEGRADADO dinámico al botón de suscribirse (igual que el ícono)
    const newsletterButton = document.querySelector('.nbd-newsletter-submit') as HTMLElement;
    if (newsletterButton) {
      const dynamicButtonGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      newsletterButton.style.background = dynamicButtonGradient;
      
      // Aplicar hover gradient también (más oscuro)
      const hoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
      newsletterButton.addEventListener('mouseenter', () => {
        newsletterButton.style.background = hoverGradient;
      });
      newsletterButton.addEventListener('mouseleave', () => {
        newsletterButton.style.background = dynamicButtonGradient;
      });
    }
    
    // APLICAR DEGRADADO dinámico a los botones de la hero section
    const heroPrimaryButton = document.querySelector('.nbd-hero-actions .nbd-btn--primary') as HTMLElement;
    if (heroPrimaryButton) {
      const dynamicHeroPrimaryGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      heroPrimaryButton.style.background = dynamicHeroPrimaryGradient;
      heroPrimaryButton.style.borderColor = primaryColor;
      
      // Aplicar hover gradient para el botón primario
      const heroPrimaryHoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
      heroPrimaryButton.addEventListener('mouseenter', () => {
        heroPrimaryButton.style.background = heroPrimaryHoverGradient;
        heroPrimaryButton.style.borderColor = darkerColor;
      });
      heroPrimaryButton.addEventListener('mouseleave', () => {
        heroPrimaryButton.style.background = dynamicHeroPrimaryGradient;
        heroPrimaryButton.style.borderColor = primaryColor;
      });
    }
    
    // APLICAR ESTILO dinámico al botón secundario de la hero section (transparente con borde y texto del color dinámico)
    const heroSecondaryButton = document.querySelector('.nbd-hero-actions .nbd-btn--secondary') as HTMLElement;
    if (heroSecondaryButton) {
      heroSecondaryButton.style.background = 'transparent';
      heroSecondaryButton.style.borderColor = primaryColor;
      heroSecondaryButton.style.color = primaryColor;
      
      // Aplicar hover para el botón secundario (se rellena con el degradado)
      const heroSecondaryHoverGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      heroSecondaryButton.addEventListener('mouseenter', () => {
        heroSecondaryButton.style.background = heroSecondaryHoverGradient;
        heroSecondaryButton.style.color = 'white';
        heroSecondaryButton.style.borderColor = primaryColor;
      });
      heroSecondaryButton.addEventListener('mouseleave', () => {
        heroSecondaryButton.style.background = 'transparent';
        heroSecondaryButton.style.color = primaryColor;
        heroSecondaryButton.style.borderColor = primaryColor;
      });
    }
    
    // APLICAR DEGRADADO dinámico al botón "Proceder al checkout" del carrito
    const cartCheckoutButton = document.querySelector('.nbd-cart-checkout') as HTMLElement;
    if (cartCheckoutButton) {
      const dynamicCartCheckoutGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      cartCheckoutButton.style.background = dynamicCartCheckoutGradient;
      cartCheckoutButton.style.borderColor = primaryColor;
      
      // Aplicar hover gradient para el botón de checkout
      const cartCheckoutHoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
      cartCheckoutButton.addEventListener('mouseenter', () => {
        const isDisabled = (cartCheckoutButton as HTMLButtonElement).disabled || cartCheckoutButton.classList.contains('nbd-btn--disabled');
        if (!isDisabled) {
          cartCheckoutButton.style.background = cartCheckoutHoverGradient;
          cartCheckoutButton.style.borderColor = darkerColor;
        }
      });
      cartCheckoutButton.addEventListener('mouseleave', () => {
        const isDisabled = (cartCheckoutButton as HTMLButtonElement).disabled || cartCheckoutButton.classList.contains('nbd-btn--disabled');
        if (!isDisabled) {
          cartCheckoutButton.style.background = dynamicCartCheckoutGradient;
          cartCheckoutButton.style.borderColor = primaryColor;
        }
      });
    }
    
    // APLICAR ESTILO dinámico al botón "Seguir comprando" del carrito (transparente con borde y texto del color dinámico)
    const cartContinueButton = document.querySelector('.nbd-cart-continue') as HTMLElement;
    if (cartContinueButton) {
      cartContinueButton.style.background = 'transparent';
      cartContinueButton.style.borderColor = primaryColor;
      cartContinueButton.style.color = primaryColor;
      
      // Aplicar hover para el botón "Seguir comprando" (se rellena con el degradado)
      const cartContinueHoverGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      cartContinueButton.addEventListener('mouseenter', () => {
        cartContinueButton.style.background = cartContinueHoverGradient;
        cartContinueButton.style.color = 'white';
        cartContinueButton.style.borderColor = primaryColor;
      });
      cartContinueButton.addEventListener('mouseleave', () => {
        cartContinueButton.style.background = 'transparent';
        cartContinueButton.style.color = primaryColor;
        cartContinueButton.style.borderColor = primaryColor;
      });
    }
    
    // APLICAR DEGRADADO dinámico a TODOS los botones primarios del sitio (.nbd-btn--primary) - EXCEPTO WhatsApp
    const allPrimaryButtons = document.querySelectorAll('.nbd-btn--primary:not(.nbd-hero-actions .nbd-btn--primary):not(.nbd-cart-checkout):not(.nbd-newsletter-submit):not(.nbd-btn--whatsapp)') as NodeListOf<HTMLElement>;
    allPrimaryButtons.forEach(button => {
      const dynamicGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      button.style.background = dynamicGradient;
      button.style.borderColor = primaryColor;
      
      // Aplicar hover gradient
      const hoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
      button.addEventListener('mouseenter', () => {
        const isDisabled = (button as HTMLButtonElement).disabled || button.classList.contains('nbd-btn--disabled');
        if (!isDisabled) {
          button.style.background = hoverGradient;
          button.style.borderColor = darkerColor;
        }
      });
      button.addEventListener('mouseleave', () => {
        const isDisabled = (button as HTMLButtonElement).disabled || button.classList.contains('nbd-btn--disabled');
        if (!isDisabled) {
          button.style.background = dynamicGradient;
          button.style.borderColor = primaryColor;
        }
      });
    });
    
    // APLICAR ESTILO dinámico a TODOS los botones secundarios del sitio (.nbd-btn--secondary)
    const allSecondaryButtons = document.querySelectorAll('.nbd-btn--secondary:not(.nbd-hero-actions .nbd-btn--secondary)') as NodeListOf<HTMLElement>;
    allSecondaryButtons.forEach(button => {
      button.style.background = 'transparent';
      button.style.borderColor = primaryColor;
      button.style.color = primaryColor;
      
      // Aplicar hover
      const hoverGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      button.addEventListener('mouseenter', () => {
        button.style.background = hoverGradient;
        button.style.color = 'white';
        button.style.borderColor = primaryColor;
      });
      button.addEventListener('mouseleave', () => {
        button.style.background = 'transparent';
        button.style.color = primaryColor;
        button.style.borderColor = primaryColor;
      });
    });
    
    // APLICAR ESTILO dinámico a botones ghost que interactúan con colores primarios
    const ghostButtons = document.querySelectorAll('.nbd-btn--ghost') as NodeListOf<HTMLElement>;
    ghostButtons.forEach(button => {
      // Mantener el estilo ghost original pero mejorar el hover
      const originalColor = button.style.color;
      button.addEventListener('mouseenter', () => {
        button.style.color = primaryColor;
        button.style.borderColor = primaryColor;
      });
      button.addEventListener('mouseleave', () => {
        button.style.color = originalColor || '';
        button.style.borderColor = '';
      });
    });
    
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
            
            // DETECTAR botones del carrito modal cuando se crean dinámicamente
            const newCartCheckoutButton = element.querySelector?.('.nbd-cart-checkout') as HTMLElement;
            if (newCartCheckoutButton) {
              const dynamicCartCheckoutGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
              newCartCheckoutButton.style.background = dynamicCartCheckoutGradient;
              newCartCheckoutButton.style.borderColor = primaryColor;
              
              // Aplicar hover gradient
              const cartCheckoutHoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
              newCartCheckoutButton.addEventListener('mouseenter', () => {
                const isDisabled = (newCartCheckoutButton as HTMLButtonElement).disabled || newCartCheckoutButton.classList.contains('nbd-btn--disabled');
                if (!isDisabled) {
                  newCartCheckoutButton.style.background = cartCheckoutHoverGradient;
                  newCartCheckoutButton.style.borderColor = darkerColor;
                }
              });
              newCartCheckoutButton.addEventListener('mouseleave', () => {
                const isDisabled = (newCartCheckoutButton as HTMLButtonElement).disabled || newCartCheckoutButton.classList.contains('nbd-btn--disabled');
                if (!isDisabled) {
                  newCartCheckoutButton.style.background = dynamicCartCheckoutGradient;
                  newCartCheckoutButton.style.borderColor = primaryColor;
                }
              });
            }
            
            const newCartContinueButton = element.querySelector?.('.nbd-cart-continue') as HTMLElement;
            if (newCartContinueButton) {
              newCartContinueButton.style.background = 'transparent';
              newCartContinueButton.style.borderColor = primaryColor;
              newCartContinueButton.style.color = primaryColor;
              
              // Aplicar hover
              const cartContinueHoverGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
              newCartContinueButton.addEventListener('mouseenter', () => {
                newCartContinueButton.style.background = cartContinueHoverGradient;
                newCartContinueButton.style.color = 'white';
                newCartContinueButton.style.borderColor = primaryColor;
              });
              newCartContinueButton.addEventListener('mouseleave', () => {
                newCartContinueButton.style.background = 'transparent';
                newCartContinueButton.style.color = primaryColor;
                newCartContinueButton.style.borderColor = primaryColor;
              });
            }
            
            // DETECTAR TODOS los botones primarios dinámicos - EXCEPTO WhatsApp
            const newPrimaryButtons = element.querySelectorAll?.('.nbd-btn--primary:not(.nbd-hero-actions .nbd-btn--primary):not(.nbd-cart-checkout):not(.nbd-newsletter-submit):not(.nbd-btn--whatsapp)') as NodeListOf<HTMLElement>;
            newPrimaryButtons?.forEach(button => {
              const dynamicGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
              button.style.background = dynamicGradient;
              button.style.borderColor = primaryColor;
              
              const hoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
              button.addEventListener('mouseenter', () => {
                const isDisabled = (button as HTMLButtonElement).disabled || button.classList.contains('nbd-btn--disabled');
                if (!isDisabled) {
                  button.style.background = hoverGradient;
                  button.style.borderColor = darkerColor;
                }
              });
              button.addEventListener('mouseleave', () => {
                const isDisabled = (button as HTMLButtonElement).disabled || button.classList.contains('nbd-btn--disabled');
                if (!isDisabled) {
                  button.style.background = dynamicGradient;
                  button.style.borderColor = primaryColor;
                }
              });
            });
            
            // DETECTAR TODOS los botones secundarios dinámicos
            const newSecondaryButtons = element.querySelectorAll?.('.nbd-btn--secondary:not(.nbd-hero-actions .nbd-btn--secondary)') as NodeListOf<HTMLElement>;
            newSecondaryButtons?.forEach(button => {
              button.style.background = 'transparent';
              button.style.borderColor = primaryColor;
              button.style.color = primaryColor;
              
              const hoverGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
              button.addEventListener('mouseenter', () => {
                button.style.background = hoverGradient;
                button.style.color = 'white';
                button.style.borderColor = primaryColor;
              });
              button.addEventListener('mouseleave', () => {
                button.style.background = 'transparent';
                button.style.color = primaryColor;
                button.style.borderColor = primaryColor;
              });
            });
            
            // DETECTAR botones ghost dinámicos
            const newGhostButtons = element.querySelectorAll?.('.nbd-btn--ghost') as NodeListOf<HTMLElement>;
            newGhostButtons?.forEach(button => {
              const originalColor = button.style.color;
              button.addEventListener('mouseenter', () => {
                button.style.color = primaryColor;
                button.style.borderColor = primaryColor;
              });
              button.addEventListener('mouseleave', () => {
                button.style.color = originalColor || '';
                button.style.borderColor = '';
              });
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
    
    // Forzar repaint para asegurar que los cambios se apliquen
    document.documentElement.offsetHeight;
    
  }
  
  // Aplicar color secundario si está disponible
  if (secondaryColor) {
    document.documentElement.style.setProperty('--nbd-secondary-custom', secondaryColor);
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

