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
exports.storeFunctions = exports.createStore = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// Create new store
exports.createStore = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        functions.logger.error('Error creating store:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create store');
    }
});
exports.storeFunctions = {
    createStore: exports.createStore,
};
//# sourceMappingURL=stores.js.map