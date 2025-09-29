import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

/**
 * Obtener el email del usuario desde la colección 'users' en Firestore
 * @param uid - ID del usuario (ownerId)
 * @returns Email del usuario o null si no se encuentra
 */
export async function getUserEmail(uid: string): Promise<string | null> {
  try {
    console.log('[getUserEmail] Obteniendo email del usuario:', uid);

    const db = getFirebaseDb();
    if (!db) {
      console.error('[getUserEmail] ❌ Firebase no está inicializado');
      return null;
    }

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error('[getUserEmail] ❌ Usuario no encontrado:', uid);
      return null;
    }

    const userData = userSnap.data();
    const email = userData.email || null;

    if (email) {
      console.log('[getUserEmail] ✅ Email obtenido:', email);
    } else {
      console.error('[getUserEmail] ❌ Usuario no tiene email:', uid);
    }

    return email;
  } catch (error) {
    console.error('[getUserEmail] ❌ Error obteniendo email:', error);
    return null;
  }
}