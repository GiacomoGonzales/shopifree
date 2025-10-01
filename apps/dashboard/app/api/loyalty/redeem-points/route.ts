import { NextRequest, NextResponse } from 'next/server';
import {
  getLoyaltyProgram,
  getCustomerPoints,
  redeemCustomerPoints,
  calculatePointsValue,
  canRedeemPoints
} from '../../../../lib/loyalty';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] 🎁 Redeeming customer points');

    const body = await request.json();
    const { storeId, customerEmail, pointsToRedeem, orderId } = body;

    if (!storeId || !customerEmail || !pointsToRedeem || !orderId) {
      console.error('[API] ❌ Missing required fields');
      return NextResponse.json(
        {
          success: false,
          error: 'storeId, customerEmail, pointsToRedeem, and orderId are required'
        },
        { status: 400 }
      );
    }

    // Verificar si el programa está activo
    const program = await getLoyaltyProgram(storeId);
    if (!program || !program.active) {
      console.log('[API] ⚠️  Loyalty program not active');
      return NextResponse.json(
        { success: false, error: 'Loyalty program not active' },
        { status: 400 }
      );
    }

    // Obtener puntos actuales del cliente
    const customerPoints = await getCustomerPoints(storeId, customerEmail);
    if (!customerPoints) {
      console.error('[API] ❌ Customer has no points');
      return NextResponse.json(
        { success: false, error: 'Customer has no points' },
        { status: 400 }
      );
    }

    // Verificar que tenga suficientes puntos
    if (customerPoints.currentPoints < pointsToRedeem) {
      console.error('[API] ❌ Insufficient points');
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient points',
          currentPoints: customerPoints.currentPoints,
          requestedPoints: pointsToRedeem
        },
        { status: 400 }
      );
    }

    // Verificar que cumpla con el mínimo para canjear
    if (!canRedeemPoints(customerPoints.currentPoints, program)) {
      console.error('[API] ❌ Below minimum points to redeem');
      return NextResponse.json(
        {
          success: false,
          error: 'Below minimum points to redeem',
          minPointsRequired: program.minPointsToRedeem,
          currentPoints: customerPoints.currentPoints
        },
        { status: 400 }
      );
    }

    // Calcular valor del descuento
    const discountValue = calculatePointsValue(pointsToRedeem, program);

    // Canjear puntos
    const success = await redeemCustomerPoints(
      storeId,
      customerEmail,
      pointsToRedeem,
      orderId
    );

    if (!success) {
      console.error('[API] ❌ Failed to redeem points');
      return NextResponse.json(
        { success: false, error: 'Failed to redeem points' },
        { status: 500 }
      );
    }

    console.log('[API] ✅ Points redeemed successfully:', {
      email: customerEmail,
      pointsRedeemed: pointsToRedeem,
      discountValue
    });

    return NextResponse.json({
      success: true,
      message: 'Points redeemed successfully',
      pointsRedeemed: pointsToRedeem,
      discountValue: discountValue,
      remainingPoints: customerPoints.currentPoints - pointsToRedeem
    });

  } catch (error) {
    console.error('[API] ❌ Error redeeming points:', error);

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
