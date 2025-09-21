import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function hasValidConfig(): boolean {
	const isValid = Boolean(
		firebaseConfig.apiKey &&
		firebaseConfig.authDomain &&
		firebaseConfig.projectId
	);

	return isValid;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getFirebaseDb(): Firestore | null {
	try {
		if (!hasValidConfig()) {
			console.warn("[public-store-v2] Firebase config ausente o inválida");
			return null;
		}
		if (!app) {
			app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
		}
		if (!db) {
			db = getFirestore(app);
		}
		return db;
	} catch (error) {
		console.warn("[public-store-v2] No se pudo inicializar Firebase", error);
		return null;
	}
}


