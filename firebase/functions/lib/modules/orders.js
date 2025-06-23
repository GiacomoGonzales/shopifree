"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderFunctions = exports.updateOrderStatus = exports.processOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// Process new order
exports.processOrder = functions.https.onCall(async (data, context) => {
    try {
        const { storeId, orderData } = data;
        if (!storeId || !orderData) {
            throw new functions.https.HttpsError('invalid-argument', 'Store ID and order data are required');
        }
        // Create order in Firestore
        const orderRef = await db.collection('orders').add(Object.assign(Object.assign({}, orderData), { storeId, status: 'pending', createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        // Update product stock
        for (const item of orderData.items) {
            const productRef = db.collection('products').doc(item.productId);
            await productRef.update({
                stock: admin.firestore.FieldValue.increment(-item.quantity),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        return { success: true, orderId: orderRef.id };
    }
    catch (error) {
        functions.logger.error('Error processing order:', error);
        throw new functions.https.HttpsError('internal', 'Failed to process order');
    }
});
// Update order status
exports.updateOrderStatus = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        functions.logger.error('Error updating order status:', error);
        throw new functions.https.HttpsError('internal', 'Failed to update order status');
    }
});
exports.orderFunctions = {
    processOrder: exports.processOrder,
    updateOrderStatus: exports.updateOrderStatus,
};
//# sourceMappingURL=orders.js.map