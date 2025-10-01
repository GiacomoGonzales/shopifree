import { NextRequest, NextResponse } from 'next/server';
import {
  getLoyaltyProgram,
  addPointsToCustomer,
  calculatePointsEarned
} from '../../../../lib/loyalty';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] 🎁 Adding points to customer');

    const body = await request.json();
    const { storeId, customerEmail, customerName, orderId, orderAmount } = body;

    if (!storeId || !customerEmail || !orderId || orderAmount === undefined) {
      console.error('[API] ❌ Missing required fields');
      return NextResponse.json(
        {
          success: false,
          error: 'storeId, customerEmail, orderId, and orderAmount are required'
        },
        { status: 400 }
      );
    }

    // Verificar si el programa está activo
    const program = await getLoyaltyProgram(storeId);
    if (!program || !program.active) {
      console.log('[API] ⚠️  Loyalty program not active');
      return NextResponse.json({
        success: true,
        message: 'Loyalty program not active',
        pointsAdded: 0
      });
    }

    // Calcular puntos ganados
    const pointsEarned = calculatePointsEarned(orderAmount, program);

    if (pointsEarned === 0) {
      console.log('[API] ℹ️  No points earned (below minimum purchase amount)');
      return NextResponse.json({
        success: true,
        message: 'Purchase below minimum amount',
        pointsAdded: 0
      });
    }

    // Agregar puntos al cliente
    const success = await addPointsToCustomer(
      storeId,
      customerEmail,
      customerName || customerEmail,
      pointsEarned,
      orderId,
      orderAmount
    );

    if (!success) {
      console.error('[API] ❌ Failed to add points');
      return NextResponse.json(
        { success: false, error: 'Failed to add points' },
        { status: 500 }
      );
    }

    console.log('[API] ✅ Points added successfully:', {
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
    console.error('[API] ❌ Error adding points:', error);

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
