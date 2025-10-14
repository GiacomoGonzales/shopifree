/**
 * Utility functions for lead tracking and conversion
 */

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Marca un lead como convertido a usuario registrado
 * Se llama después del registro exitoso para tracking de conversión
 */
export async function markLeadAsConverted(
  email: string,
  userId: string
): Promise<void> {
  try {
    if (!db) {
      console.warn('⚠️ Firebase not available, skipping lead conversion tracking')
      return
    }

    console.log('🔄 Checking for lead conversion:', { email, userId })

    // Buscar el lead por email
    const leadsCollection = collection(db, 'leads')
    const q = query(
      leadsCollection,
      where('email', '==', email.toLowerCase().trim())
    )
    const leadSnapshot = await getDocs(q)

    if (leadSnapshot.empty) {
      console.log('ℹ️ No lead found for email:', email)
      return
    }

    // Actualizar el primer lead encontrado (debería ser único)
    const leadDoc = leadSnapshot.docs[0]
    await updateDoc(leadDoc.ref, {
      convertedToUser: true,
      userId,
      registeredAt: serverTimestamp(),
      status: 'registered',
      updatedAt: serverTimestamp()
    })

    console.log('✅ Lead marked as converted:', leadDoc.id)
  } catch (error) {
    // No lanzar error para no interrumpir el flujo de registro
    console.error('❌ Error marking lead as converted:', error)
  }
}
