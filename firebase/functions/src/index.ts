import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export function modules
export { emailFunctions } from './modules/email';
export { orderFunctions } from './modules/orders';
export { storeFunctions } from './modules/stores';

// Export Next.js app function
export { nextAppFunction as nextApp } from './nextApp';

// Example function
export const helloWorld = functions.https.onRequest((request: any, response: any) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
}); 