import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../../../../lib/firebase';

export async function GET(request: NextRequest) {
  try {
    console.log('[API Loyalty] 🎁 Getting loyalty program configuration');

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

    if (!storeId) {
      console.error('[API Loyalty] ❌ storeId missing');
      return NextResponse.json(
        { success: false, error: 'storeId is required' },
        { status: 400 }
      );
    }

    // Obtener configuración del programa de lealtad
    const programRef = doc(db, 'stores', storeId, 'config', 'loyaltyProgram');
    const programDoc = await getDoc(programRef);

    if (!programDoc.exists()) {
      return NextResponse.json({
        success: true,
        active: false
      });
    }

    const program = programDoc.data();

    if (!program.active) {
      return NextResponse.json({
        success: true,
        active: false
      });
    }

    console.log('[API Loyalty] ✅ Program configuration retrieved:', {
      active: program.active,
      pointsPerCurrency: program.pointsPerCurrency
    });

    return NextResponse.json({
      success: true,
      active: true,
      program: {
        pointsPerCurrency: program.pointsPerCurrency,
        minPurchaseAmount: program.minPurchaseAmount,
        pointsValue: program.pointsValue,
        minPointsToRedeem: program.minPointsToRedeem
      }
    });

  } catch (error) {
    console.error('[API Loyalty] ❌ Error getting program configuration:', error);

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
