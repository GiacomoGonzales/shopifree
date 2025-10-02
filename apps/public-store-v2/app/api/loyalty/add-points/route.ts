import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../../../../lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('[API Loyalty] 🎁 Adding points to customer');

    const db = getFirebaseDb();
    if (!db) {
      console.error('[API Loyalty] ❌ Firebase not initialized');
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { storeId, customerEmail, customerName, orderId, orderAmount } = body;

    if (!storeId || !customerEmail || !orderId || orderAmount === undefined) {
      console.error('[API Loyalty] ❌ Missing required fields');
      return NextResponse.json(
        {
          success: false,
          error: 'storeId, customerEmail, orderId, and orderAmount are required'
        },
        { status: 400 }
      );
    }

    // Verificar si el programa está activo
    const programRef = doc(db, 'stores', storeId, 'config', 'loyaltyProgram');
    const programDoc = await getDoc(programRef);

    if (!programDoc.exists()) {
      console.log('[API Loyalty] ⚠️  Loyalty program not configured');
      return NextResponse.json({
        success: true,
        message: 'Loyalty program not configured',
        pointsAdded: 0
      });
    }

    const program = programDoc.data();

    if (!program.active) {
      console.log('[API Loyalty] ⚠️  Loyalty program not active');
      return NextResponse.json({
        success: true,
        message: 'Loyalty program not active',
        pointsAdded: 0
      });
    }

    // Calcular puntos ganados
    if (orderAmount < program.minPurchaseAmount) {
      console.log('[API Loyalty] ℹ️  Order below minimum amount');
      return NextResponse.json({
        success: true,
        message: 'Purchase below minimum amount',
        pointsAdded: 0
      });
    }

    const pointsEarned = Math.floor(orderAmount * program.pointsPerCurrency);

    if (pointsEarned === 0) {
      console.log('[API Loyalty] ℹ️  No points earned');
      return NextResponse.json({
        success: true,
        message: 'No points earned',
        pointsAdded: 0
      });
    }

    // Buscar registro de puntos del cliente
    const pointsRef = collection(db, 'stores', storeId, 'customerPoints');
    const q = query(pointsRef, where('customerEmail', '==', customerEmail.toLowerCase()));
    const querySnapshot = await getDocs(q);

    const transaction = {
      type: 'earned',
      points: pointsEarned,
      orderId,
      orderAmount,
      description: `Compra #${orderId.slice(-6)}`,
      date: new Date()
    };

    if (querySnapshot.empty) {
      // Crear nuevo registro
      await addDoc(pointsRef, {
        storeId,
        customerEmail: customerEmail.toLowerCase(),
        customerName: customerName || customerEmail,
        currentPoints: pointsEarned,
        totalPointsEarned: pointsEarned,
        totalPointsRedeemed: 0,
        history: [transaction],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('[API Loyalty] ✅ New points record created');
    } else {
      // Actualizar registro existente
      const pointsDoc = querySnapshot.docs[0];
      const currentData = pointsDoc.data();

      await updateDoc(doc(db, 'stores', storeId, 'customerPoints', pointsDoc.id), {
        currentPoints: (currentData.currentPoints || 0) + pointsEarned,
        totalPointsEarned: (currentData.totalPointsEarned || 0) + pointsEarned,
        customerName: customerName || currentData.customerName || customerEmail,
        history: [...(currentData.history || []), transaction],
        updatedAt: serverTimestamp()
      });
      console.log('[API Loyalty] ✅ Points added to existing record');
    }

    console.log('[API Loyalty] ✅ Points added successfully:', {
      email: customerEmail,
      points: pointsEarned,
      orderAmount
    });

    return NextResponse.json({
      success: true,
      message: 'Points added successfully',
      pointsAdded: pointsEarned
    });

  } catch (error) {
    console.error('[API Loyalty] ❌ Error adding points:', error);

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
