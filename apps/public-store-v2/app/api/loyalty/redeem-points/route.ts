import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../../../../lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('[API Loyalty] 🎁 Redeeming customer points');

    const db = getFirebaseDb();
    if (!db) {
      console.error('[API Loyalty] ❌ Firebase not initialized');
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { storeId, customerEmail, pointsToRedeem, orderId } = body;

    if (!storeId || !customerEmail || !pointsToRedeem || !orderId) {
      console.error('[API Loyalty] ❌ Missing required fields');
      return NextResponse.json(
        {
          success: false,
          error: 'storeId, customerEmail, pointsToRedeem, and orderId are required'
        },
        { status: 400 }
      );
    }

    // Verificar si el programa está activo
    const programRef = doc(db, 'stores', storeId, 'config', 'loyaltyProgram');
    const programDoc = await getDoc(programRef);

    if (!programDoc.exists()) {
      console.log('[API Loyalty] ⚠️  Loyalty program not configured');
      return NextResponse.json(
        { success: false, error: 'Loyalty program not configured' },
        { status: 400 }
      );
    }

    const program = programDoc.data();

    if (!program.active) {
      console.log('[API Loyalty] ⚠️  Loyalty program not active');
      return NextResponse.json(
        { success: false, error: 'Loyalty program not active' },
        { status: 400 }
      );
    }

    // Buscar registro de puntos del cliente
    const pointsRef = collection(db, 'stores', storeId, 'customerPoints');
    const q = query(pointsRef, where('customerEmail', '==', customerEmail.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('[API Loyalty] ❌ Customer has no points');
      return NextResponse.json(
        { success: false, error: 'Customer has no points' },
        { status: 400 }
      );
    }

    const pointsDoc = querySnapshot.docs[0];
    const currentData = pointsDoc.data();

    // Verificar que tenga suficientes puntos
    if (currentData.currentPoints < pointsToRedeem) {
      console.error('[API Loyalty] ❌ Insufficient points');
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient points',
          currentPoints: currentData.currentPoints,
          requestedPoints: pointsToRedeem
        },
        { status: 400 }
      );
    }

    // Verificar que cumpla con el mínimo para canjear
    if (pointsToRedeem < program.minPointsToRedeem) {
      console.error('[API Loyalty] ❌ Below minimum points to redeem');
      return NextResponse.json(
        {
          success: false,
          error: 'Below minimum points to redeem',
          minPointsRequired: program.minPointsToRedeem,
          requestedPoints: pointsToRedeem
        },
        { status: 400 }
      );
    }

    // Calcular valor del descuento
    const discountValue = pointsToRedeem * program.pointsValue;

    // Crear transacción de redención
    const transaction = {
      type: 'redeemed',
      points: pointsToRedeem,
      orderId,
      discountValue,
      description: `Canjeado en pedido #${orderId.slice(-6)}`,
      date: new Date()
    };

    // Actualizar puntos del cliente
    await updateDoc(doc(db, 'stores', storeId, 'customerPoints', pointsDoc.id), {
      currentPoints: currentData.currentPoints - pointsToRedeem,
      totalPointsRedeemed: (currentData.totalPointsRedeemed || 0) + pointsToRedeem,
      history: [...(currentData.history || []), transaction],
      updatedAt: new Date()
    });

    console.log('[API Loyalty] ✅ Points redeemed successfully:', {
      email: customerEmail,
      pointsRedeemed: pointsToRedeem,
      discountValue,
      remainingPoints: currentData.currentPoints - pointsToRedeem
    });

    return NextResponse.json({
      success: true,
      message: 'Points redeemed successfully',
      pointsRedeemed: pointsToRedeem,
      discountValue,
      remainingPoints: currentData.currentPoints - pointsToRedeem
    });

  } catch (error) {
    console.error('[API Loyalty] ❌ Error redeeming points:', error);

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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
