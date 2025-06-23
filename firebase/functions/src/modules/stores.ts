import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Create new store
export const createStore = functions.https.onCall(async (data: any, context: any) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { name, domain, description } = data;
    
    if (!name || !domain) {
      throw new functions.https.HttpsError('invalid-argument', 'Name and domain are required');
    }

    // Check if domain is available
    const existingStore = await db.collection('stores').where('domain', '==', domain).get();
    if (!existingStore.empty) {
      throw new functions.https.HttpsError('already-exists', 'Domain is already taken');
    }

    // Create store
    const storeRef = await db.collection('stores').add({
      name,
      domain,
      description: description || '',
      ownerId: context.auth.uid,
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1f2937',
        fontFamily: 'Inter',
        layout: 'modern',
      },
      settings: {
        isActive: true,
        allowGuestCheckout: true,
        currency: 'USD',
        language: 'en',
        paymentMethods: ['card'],
        shippingZones: [],
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, storeId: storeRef.id };
  } catch (error) {
    functions.logger.error('Error creating store:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create store');
  }
});

export const storeFunctions = {
  createStore,
}; 