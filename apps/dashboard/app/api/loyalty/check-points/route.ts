import { NextRequest, NextResponse } from 'next/server';
import { getCustomerPoints, getLoyaltyProgram, calculatePointsValue } from '../../../../lib/loyalty';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] 🎁 Checking customer points');

    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const customerEmail = searchParams.get('customerEmail');

    if (!storeId || !customerEmail) {
      console.error('[API] ❌ storeId or customerEmail missing');
      return NextResponse.json(
        { success: false, error: 'storeId and customerEmail are required' },
        { status: 400 }
      );
    }

    // Verificar si el programa está activo
    const program = await getLoyaltyProgram(storeId);
    if (!program || !program.active) {
      return NextResponse.json({
        success: true,
        active: false,
        points: 0,
        value: 0,
        canRedeem: false
      });
    }

    // Obtener puntos del cliente
    const customerPoints = await getCustomerPoints(storeId, customerEmail);

    if (!customerPoints) {
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

    const pointsValue = calculatePointsValue(customerPoints.currentPoints, program);
    const canRedeem = customerPoints.currentPoints >= program.minPointsToRedeem;

    console.log('[API] ✅ Points retrieved:', {
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
    console.error('[API] ❌ Error checking points:', error);

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
