import { collection, addDoc, updateDoc, doc, getDocs, getDoc, query, where, orderBy, serverTimestamp, Timestamp, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

/**
 * Programa de Lealtad
 * Un programa por tienda que define cómo se ganan y canjean puntos
 */
export interface LoyaltyProgram {
  id: string;
  storeId: string;
  active: boolean;

  // Configuración de ganancia de puntos
  pointsPerCurrency: number; // Ej: 1 punto por cada $1 gastado
  minPurchaseAmount: number; // Monto mínimo de compra para ganar puntos

  // Configuración de canje de puntos
  pointsValue: number; // Valor de cada punto en moneda local (ej: 100 puntos = $10, entonces pointsValue = 0.1)
  minPointsToRedeem: number; // Puntos mínimos para canjear

  // Notificaciones
  sendEmailOnEarn: boolean; // Enviar email cuando gana puntos
  sendEmailOnRedeem: boolean; // Enviar email cuando canjea puntos

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Puntos de un Cliente
 * Rastrea los puntos acumulados por email (sin necesidad de cuenta)
 */
export interface CustomerPoints {
  id: string;
  storeId: string;
  customerEmail: string;
  customerName?: string;

  // Puntos
  currentPoints: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;

  // Historial
  history: PointsTransaction[];

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Transacción de Puntos
 */
export interface PointsTransaction {
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  orderId?: string;
  orderAmount?: number;
  description: string;
  date: Timestamp;
}

/**
 * Datos para crear un programa de lealtad
 */
export interface CreateLoyaltyProgramData {
  pointsPerCurrency: number;
  minPurchaseAmount: number;
  pointsValue: number;
  minPointsToRedeem: number;
  sendEmailOnEarn: boolean;
  sendEmailOnRedeem: boolean;
}

// ==========================================
// FUNCIONES PARA PROGRAMA DE LEALTAD
// ==========================================

/**
 * Obtener el programa de lealtad de una tienda
 */
export async function getLoyaltyProgram(storeId: string): Promise<LoyaltyProgram | null> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Loyalty] Firebase not initialized');
    return null;
  }

  try {
    console.log('[Loyalty] Fetching loyalty program for storeId:', storeId);

    const programRef = doc(db, 'stores', storeId, 'config', 'loyaltyProgram');
    const programDoc = await getDoc(programRef);

    if (!programDoc.exists()) {
      console.log('[Loyalty] No loyalty program found for store');
      return null;
    }

    console.log('[Loyalty] Loyalty program found');
    return {
      id: programDoc.id,
      storeId,
      ...programDoc.data()
    } as LoyaltyProgram;

  } catch (error) {
    console.error('[Loyalty] Error fetching loyalty program:', error);
    return null;
  }
}

/**
 * Crear o actualizar el programa de lealtad de una tienda
 */
export async function saveLoyaltyProgram(storeId: string, programData: CreateLoyaltyProgramData, active: boolean = true): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Loyalty] Firebase not initialized');
    return false;
  }

  try {
    console.log('[Loyalty] Saving loyalty program for storeId:', storeId);
    console.log('[Loyalty] Program data:', programData);

    const programRef = doc(db, 'stores', storeId, 'config', 'loyaltyProgram');

    // Verificar si ya existe
    const existingDoc = await getDoc(programRef);

    if (existingDoc.exists()) {
      // Actualizar
      await updateDoc(programRef, {
        ...programData,
        active,
        updatedAt: serverTimestamp()
      });
      console.log('[Loyalty] Loyalty program updated');
    } else {
      // Crear
      await setDoc(programRef, {
        storeId,
        ...programData,
        active,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('[Loyalty] Loyalty program created');
    }

    return true;
  } catch (error) {
    console.error('[Loyalty] Error saving loyalty program:', error);
    return false;
  }
}

/**
 * Activar/Desactivar programa de lealtad
 */
export async function toggleLoyaltyProgram(storeId: string, active: boolean): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Loyalty] Firebase not initialized');
    return false;
  }

  try {
    console.log('[Loyalty] Toggling loyalty program:', { storeId, active });

    const programRef = doc(db, 'stores', storeId, 'config', 'loyaltyProgram');
    await updateDoc(programRef, {
      active,
      updatedAt: serverTimestamp()
    });

    console.log('[Loyalty] Loyalty program toggled successfully');
    return true;
  } catch (error) {
    console.error('[Loyalty] Error toggling loyalty program:', error);
    return false;
  }
}

// ==========================================
// FUNCIONES PARA PUNTOS DE CLIENTES
// ==========================================

/**
 * Obtener los puntos de un cliente por email
 */
export async function getCustomerPoints(storeId: string, customerEmail: string): Promise<CustomerPoints | null> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Loyalty] Firebase not initialized');
    return null;
  }

  try {
    console.log('[Loyalty] Fetching points for customer:', customerEmail);

    const pointsRef = collection(db, 'stores', storeId, 'customerPoints');
    const q = query(pointsRef, where('customerEmail', '==', customerEmail.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('[Loyalty] No points record found for customer');
      return null;
    }

    const pointsDoc = querySnapshot.docs[0];
    console.log('[Loyalty] Points record found:', pointsDoc.data());

    return {
      id: pointsDoc.id,
      ...pointsDoc.data()
    } as CustomerPoints;

  } catch (error) {
    console.error('[Loyalty] Error fetching customer points:', error);
    return null;
  }
}

/**
 * Agregar puntos a un cliente (cuando hace una compra)
 */
export async function addPointsToCustomer(
  storeId: string,
  customerEmail: string,
  customerName: string,
  points: number,
  orderId: string,
  orderAmount: number
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Loyalty] Firebase not initialized');
    return false;
  }

  try {
    console.log('[Loyalty] Adding points to customer:', {
      customerEmail,
      points,
      orderId
    });

    const pointsRef = collection(db, 'stores', storeId, 'customerPoints');
    const q = query(pointsRef, where('customerEmail', '==', customerEmail.toLowerCase()));
    const querySnapshot = await getDocs(q);

    const transaction: PointsTransaction = {
      type: 'earned',
      points,
      orderId,
      orderAmount,
      description: `Compra #${orderId.slice(-6)}`,
      date: serverTimestamp() as Timestamp
    };

    if (querySnapshot.empty) {
      // Crear nuevo registro de puntos
      await addDoc(pointsRef, {
        storeId,
        customerEmail: customerEmail.toLowerCase(),
        customerName,
        currentPoints: points,
        totalPointsEarned: points,
        totalPointsRedeemed: 0,
        history: [transaction],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('[Loyalty] New points record created');
    } else {
      // Actualizar registro existente
      const pointsDoc = querySnapshot.docs[0];
      const currentData = pointsDoc.data() as CustomerPoints;

      await updateDoc(doc(db, 'stores', storeId, 'customerPoints', pointsDoc.id), {
        currentPoints: (currentData.currentPoints || 0) + points,
        totalPointsEarned: (currentData.totalPointsEarned || 0) + points,
        customerName, // Actualizar nombre en caso de que haya cambiado
        history: [...(currentData.history || []), transaction],
        updatedAt: serverTimestamp()
      });
      console.log('[Loyalty] Points added to existing record');
    }

    return true;
  } catch (error) {
    console.error('[Loyalty] Error adding points to customer:', error);
    return false;
  }
}

/**
 * Canjear puntos de un cliente (cuando usa en checkout)
 */
export async function redeemCustomerPoints(
  storeId: string,
  customerEmail: string,
  pointsToRedeem: number,
  orderId: string
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Loyalty] Firebase not initialized');
    return false;
  }

  try {
    console.log('[Loyalty] Redeeming points for customer:', {
      customerEmail,
      pointsToRedeem,
      orderId
    });

    const pointsRef = collection(db, 'stores', storeId, 'customerPoints');
    const q = query(pointsRef, where('customerEmail', '==', customerEmail.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('[Loyalty] No points record found for customer');
      return false;
    }

    const pointsDoc = querySnapshot.docs[0];
    const currentData = pointsDoc.data() as CustomerPoints;

    // Verificar que tenga suficientes puntos
    if (currentData.currentPoints < pointsToRedeem) {
      console.error('[Loyalty] Insufficient points');
      return false;
    }

    const transaction: PointsTransaction = {
      type: 'redeemed',
      points: -pointsToRedeem,
      orderId,
      description: `Canjeados en compra #${orderId.slice(-6)}`,
      date: serverTimestamp() as Timestamp
    };

    await updateDoc(doc(db, 'stores', storeId, 'customerPoints', pointsDoc.id), {
      currentPoints: currentData.currentPoints - pointsToRedeem,
      totalPointsRedeemed: (currentData.totalPointsRedeemed || 0) + pointsToRedeem,
      history: [...(currentData.history || []), transaction],
      updatedAt: serverTimestamp()
    });

    console.log('[Loyalty] Points redeemed successfully');
    return true;
  } catch (error) {
    console.error('[Loyalty] Error redeeming points:', error);
    return false;
  }
}

/**
 * Calcular cuántos puntos gana un cliente por una compra
 */
export function calculatePointsEarned(
  orderAmount: number,
  program: LoyaltyProgram
): number {
  // Verificar monto mínimo
  if (orderAmount < program.minPurchaseAmount) {
    return 0;
  }

  // Calcular puntos
  const points = Math.floor(orderAmount * program.pointsPerCurrency);
  return points;
}

/**
 * Calcular cuánto dinero valen los puntos
 */
export function calculatePointsValue(
  points: number,
  program: LoyaltyProgram
): number {
  return points * program.pointsValue;
}

/**
 * Verificar si el cliente puede canjear puntos
 */
export function canRedeemPoints(
  customerPoints: number,
  program: LoyaltyProgram
): boolean {
  return customerPoints >= program.minPointsToRedeem;
}

/**
 * Obtener todos los clientes con puntos (para el dashboard)
 */
export async function getAllCustomersWithPoints(storeId: string): Promise<CustomerPoints[]> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Loyalty] Firebase not initialized');
    return [];
  }

  try {
    console.log('[Loyalty] Fetching all customers with points for storeId:', storeId);

    const pointsRef = collection(db, 'stores', storeId, 'customerPoints');
    const q = query(pointsRef, orderBy('currentPoints', 'desc'));
    const querySnapshot = await getDocs(q);

    console.log('[Loyalty] Found', querySnapshot.docs.length, 'customers with points');

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CustomerPoints[];

  } catch (error) {
    console.error('[Loyalty] Error fetching customers with points:', error);
    return [];
  }
}

/**
 * Generar un token de acceso temporal para ver puntos (magic link)
 */
export async function generatePointsAccessToken(
  storeId: string,
  customerEmail: string
): Promise<string | null> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Loyalty] Firebase not initialized');
    return null;
  }

  try {
    console.log('[Loyalty] Generating access token for:', customerEmail);

    // Generar token único
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Guardar token con expiración de 7 días
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokensRef = collection(db, 'stores', storeId, 'pointsAccessTokens');
    await addDoc(tokensRef, {
      token,
      customerEmail: customerEmail.toLowerCase(),
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp(),
      used: false
    });

    console.log('[Loyalty] Access token generated:', token);
    return token;

  } catch (error) {
    console.error('[Loyalty] Error generating access token:', error);
    return null;
  }
}

/**
 * Validar un token de acceso temporal
 */
export async function validatePointsAccessToken(
  storeId: string,
  token: string
): Promise<string | null> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Loyalty] Firebase not initialized');
    return null;
  }

  try {
    console.log('[Loyalty] Validating access token:', token);

    const tokensRef = collection(db, 'stores', storeId, 'pointsAccessTokens');
    const q = query(tokensRef, where('token', '==', token), where('used', '==', false));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('[Loyalty] Token not found or already used');
      return null;
    }

    const tokenDoc = querySnapshot.docs[0];
    const tokenData = tokenDoc.data();

    // Verificar expiración
    const now = new Date();
    const expiresAt = tokenData.expiresAt.toDate();

    if (now > expiresAt) {
      console.log('[Loyalty] Token expired');
      return null;
    }

    console.log('[Loyalty] Token valid for email:', tokenData.customerEmail);
    return tokenData.customerEmail;

  } catch (error) {
    console.error('[Loyalty] Error validating access token:', error);
    return null;
  }
}
