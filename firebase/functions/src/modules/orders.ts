import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Process new order
export const processOrder = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { storeId, orderData } = data;
    
    if (!storeId || !orderData) {
      throw new functions.https.HttpsError('invalid-argument', 'Store ID and order data are required');
    }

    // Create order in Firestore
    const orderRef = await db.collection('orders').add({
      ...orderData,
      storeId,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update product stock
    for (const item of orderData.items) {
      const productRef = db.collection('products').doc(item.productId);
      await productRef.update({
        stock: admin.firestore.FieldValue.increment(-item.quantity),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return { success: true, orderId: orderRef.id };
  } catch (error) {
    functions.logger.error('Error processing order:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process order');
  }
});

// Update order status
export const updateOrderStatus = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { orderId, status } = data;
    
    if (!orderId || !status) {
      throw new functions.https.HttpsError('invalid-argument', 'Order ID and status are required');
    }

    await db.collection('orders').doc(orderId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    functions.logger.error('Error updating order status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update order status');
  }
});

export const orderFunctions = {
  processOrder,
  updateOrderStatus,
}; 