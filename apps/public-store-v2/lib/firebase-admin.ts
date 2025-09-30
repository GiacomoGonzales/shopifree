import admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

export function getFirebaseAdmin() {
  // Si ya está inicializado, retornarlo
  if (adminApp) {
    return admin;
  }

  // Verificar que las credenciales estén configuradas
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
    console.error('[Firebase Admin] FIREBASE_ADMIN_PROJECT_ID not configured');
    return null;
  }

  try {
    // Inicializar Firebase Admin SDK
    // Usar las credenciales desde variables de entorno
    const serviceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebaseio.com`
    });

    console.log('[Firebase Admin] ✅ Initialized successfully');
    return admin;

  } catch (error) {
    console.error('[Firebase Admin] ❌ Error initializing:', error);

    // Si el error es porque ya está inicializado, usar la app existente
    if ((error as any).code === 'app/duplicate-app') {
      adminApp = admin.app();
      return admin;
    }

    return null;
  }
}