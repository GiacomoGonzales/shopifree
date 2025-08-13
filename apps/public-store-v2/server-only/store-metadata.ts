import "server-only";

type StoreMetadata = {
	title?: string;
	description?: string;
	image?: string;
};

export async function getStoreMetadata(subdomain: string): Promise<StoreMetadata | null> {
	try {
		// En una implementación real, aquí se consultaría una DB/endpoint.
		// Para SSR seguro, devolvemos mínimos o null.
		return null;
	} catch (e) {
		console.warn("[public-store-v2] getStoreMetadata fallo; usando defaults", e);
		return null;
	}
}


