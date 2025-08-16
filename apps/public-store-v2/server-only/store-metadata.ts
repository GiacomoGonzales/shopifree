import "server-only";

type StoreMetadata = {
	title?: string;
	description?: string;
	image?: string;
	keywords?: string;
	ogTitle?: string;
	ogDescription?: string;
	ogImage?: string;
	whatsappImage?: string;
	favicon?: string;
	robots?: string;
	canonicalUrl?: string;
	structuredDataEnabled?: boolean;
	googleAnalytics?: string;
	googleSearchConsole?: string;
	metaPixel?: string;
	tiktokPixel?: string;
	// Datos básicos de la tienda
	storeName?: string;
	logoUrl?: string;
	address?: string;
	phone?: string;
	emailStore?: string;
};

export async function getStoreMetadata(subdomain: string): Promise<StoreMetadata | null> {
	try {
		// Importar dinámicamente Firebase Admin o client dependiendo del entorno
		const { getApps, getApp, initializeApp } = await import('firebase/app');
		const { getFirestore, collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
		
		// Inicializar Firebase si no está ya inicializado
		let app;
		if (getApps().length === 0) {
			app = initializeApp({
				apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
				authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
				projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
				storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
				messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
				appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
			});
		} else {
			app = getApp();
		}
		
		const db = getFirestore(app);
		
		// 1. Obtener el storeId basado en el subdomain
		const storesRef = collection(db, "stores");
		let q = query(storesRef, where("subdomain", "==", subdomain));
		let snap = await getDocs(q);
		
		if (snap.empty) {
			// Fallback: buscar por slug
			q = query(storesRef, where("slug", "==", subdomain));
			snap = await getDocs(q);
		}
		
		if (snap.empty) {
			console.log(`[store-metadata] No se encontró tienda para subdomain: ${subdomain}`);
			return null;
		}
		
		const storeDoc = snap.docs[0];
		const storeId = storeDoc.id;
		const storeData = storeDoc.data();
		
		// 2. Obtener los datos de SEO desde advanced.seo
		const seoData = storeData?.advanced?.seo || {};
		const integrationsData = storeData?.advanced?.integrations || {};
		
		// 3. Construir el objeto de metadata con todos los campos SEO
		const metadata: StoreMetadata = {
			// Datos básicos - priorizar SEO personalizado sobre datos básicos de tienda
			title: seoData.title || storeData.storeName || `${subdomain} | Shopifree`,
			description: seoData.metaDescription || storeData.description || "Tienda en Shopifree.",
			
			// Imágenes
			image: seoData.ogImage || storeData.logoUrl || "/default-og.png",
			ogImage: seoData.ogImage,
			whatsappImage: seoData.whatsappImage,
			favicon: seoData.favicon,
			
			// SEO avanzado
			keywords: seoData.keywords ? seoData.keywords.join(', ') : undefined,
			ogTitle: seoData.ogTitle,
			ogDescription: seoData.ogDescription,
			robots: seoData.robots,
			canonicalUrl: seoData.canonicalUrl,
			structuredDataEnabled: seoData.structuredDataEnabled ?? true,
			
			// Analytics y tracking
			googleAnalytics: integrationsData.googleAnalytics || seoData.googleAnalytics,
			googleSearchConsole: seoData.googleSearchConsole,
			metaPixel: integrationsData.metaPixel || seoData.metaPixel,
			tiktokPixel: seoData.tiktokPixel,
			
			// Datos básicos de la tienda para datos estructurados
			storeName: storeData.storeName,
			logoUrl: storeData.logoUrl,
			address: storeData.address || storeData.direction || storeData.direccion,
			phone: storeData.phone || storeData.phoneNumber,
			emailStore: storeData.emailStore || storeData.email
		};
		
		console.log(`✅ [store-metadata] Datos SEO cargados para ${subdomain}:`, {
			title: metadata.title,
			hasOgImage: !!metadata.ogImage,
			hasKeywords: !!metadata.keywords,
			hasAnalytics: !!metadata.googleAnalytics
		});
		
		return metadata;
		
	} catch (e) {
		console.warn("[public-store-v2] getStoreMetadata fallo; usando defaults", e);
		return null;
	}
}


