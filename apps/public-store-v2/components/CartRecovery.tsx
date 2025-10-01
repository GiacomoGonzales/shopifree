'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../lib/cart-context';
import { recoverAbandonedCart, loadCustomerFromLocalStorage } from '../lib/customers';

interface CartRecoveryProps {
  storeId: string;
}

export default function CartRecovery({ storeId }: CartRecoveryProps) {
  const searchParams = useSearchParams();
  const { loadCart, openCart } = useCart();
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    const shouldRecover = searchParams.get('recover');

    if (shouldRecover === 'cart' && !isRecovering) {
      setIsRecovering(true);
      handleCartRecovery();
    }
  }, [searchParams]);

  const handleCartRecovery = async () => {
    try {
      console.log('[CartRecovery] 🛒 Iniciando recuperación de carrito...');

      // Obtener email del cliente desde localStorage
      const customerData = loadCustomerFromLocalStorage();

      if (!customerData || !customerData.email) {
        console.warn('[CartRecovery] ⚠️ No se encontró email del cliente en localStorage');
        // Aún así intentamos recuperar si el usuario tiene session
        return;
      }

      console.log('[CartRecovery] 📧 Email del cliente:', customerData.email);

      // Recuperar carrito abandonado desde Firestore
      const abandonedCartItems = await recoverAbandonedCart(storeId, customerData.email);

      if (!abandonedCartItems || abandonedCartItems.length === 0) {
        console.log('[CartRecovery] ℹ️ No hay carrito abandonado para recuperar');
        return;
      }

      console.log('[CartRecovery] ✅ Carrito recuperado:', abandonedCartItems);

      // Cargar items en el carrito
      loadCart(abandonedCartItems);

      // Obtener el cupón de la URL si existe
      const couponParam = searchParams.get('coupon');
      if (couponParam) {
        // Guardar cupón en localStorage para que se aplique en el checkout
        try {
          localStorage.setItem('recovery_coupon', couponParam);
          console.log('[CartRecovery] 🎁 Cupón guardado para aplicación automática:', couponParam);
        } catch (error) {
          console.error('[CartRecovery] ❌ Error al guardar cupón:', error);
        }
      }

      // Abrir el carrito automáticamente
      setTimeout(() => {
        openCart();
      }, 500);

      console.log('[CartRecovery] 🎉 Carrito recuperado exitosamente');

    } catch (error) {
      console.error('[CartRecovery] ❌ Error al recuperar carrito:', error);
    } finally {
      setIsRecovering(false);
    }
  };

  return null; // Este componente no renderiza nada
}
