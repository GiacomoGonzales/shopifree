import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { storeId, couponId } = await request.json();

    if (!storeId || !couponId) {
      return NextResponse.json(
        { success: false, error: 'Missing storeId or couponId' },
        { status: 400 }
      );
    }

    console.log('[API] Incrementing coupon usage:', { storeId, couponId });

    // Usar Firebase Admin SDK con permisos completos
    const admin = getFirebaseAdmin();
    if (!admin) {
      console.error('[API] Firebase Admin not initialized');
      return NextResponse.json(
        { success: false, error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const couponRef = admin.firestore()
      .collection('stores')
      .doc(storeId)
      .collection('coupons')
      .doc(couponId);

    await couponRef.update({
      totalUses: admin.firestore.FieldValue.increment(1)
    });

    console.log('[API] ✅ Coupon usage incremented successfully');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[API] ❌ Error incrementing coupon usage:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}