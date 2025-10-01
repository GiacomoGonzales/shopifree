import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../../../../lib/firebase';

export async function GET(request: NextRequest) {
  try {
    console.log('[API Loyalty] 🎁 Checking customer points');

    const db = getFirebaseDb();
    if (!db) {
      console.error('[API Loyalty] ❌ Firebase not initialized');
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const customerEmail = searchParams.get('customerEmail');

    if (!storeId || !customerEmail) {
      console.error('[API Loyalty] ❌ storeId or customerEmail missing');
      return NextResponse.json(
        { success: false, error: 'storeId and customerEmail are required' },
        { status: 400 }
      );
    }

    // Verificar si el programa de lealtad está activo
    const programRef = doc(db, 'stores', storeId, 'config', 'loyaltyProgram');
    const programDoc = await getDoc(programRef);

    if (!programDoc.exists()) {
      return NextResponse.json({
        success: true,
        active: false,
        points: 0,
        value: 0,
        canRedeem: false
      });
    }

    const program = programDoc.data();

    if (!program.active) {
      return NextResponse.json({
        success: true,
        active: false,
        points: 0,
        value: 0,
        canRedeem: false
      });
    }

    // Obtener puntos del cliente
    const pointsRef = collection(db, 'stores', storeId, 'customerPoints');
    const q = query(pointsRef, where('customerEmail', '==', customerEmail.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({
        success: true,
        active: true,
        points: 0,
        value: 0,
        canRedeem: false,
        program: {
          pointsPerCurrency: program.pointsPerCurrency,
          minPurchaseAmount: program.minPurchaseAmount,
          pointsValue: program.pointsValue,
          minPointsToRedeem: program.minPointsToRedeem
        }
      });
    }

    const pointsDoc = querySnapshot.docs[0];
    const customerPoints = pointsDoc.data();

    const pointsValue = customerPoints.currentPoints * program.pointsValue;
    const canRedeem = customerPoints.currentPoints >= program.minPointsToRedeem;

    console.log('[API Loyalty] ✅ Points retrieved:', {
      email: customerEmail,
      points: customerPoints.currentPoints,
      value: pointsValue
    });

    return NextResponse.json({
      success: true,
      active: true,
      points: customerPoints.currentPoints,
      value: pointsValue,
      canRedeem,
      program: {
        pointsPerCurrency: program.pointsPerCurrency,
        minPurchaseAmount: program.minPurchaseAmount,
        pointsValue: program.pointsValue,
        minPointsToRedeem: program.minPointsToRedeem
      }
    });

  } catch (error) {
    console.error('[API Loyalty] ❌ Error checking points:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
