'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '../lib/analytics-tracker';

type Props = {
  storeId: string | null;
};

/**
 * Componente para trackear page views automáticamente
 * Se monta en el layout y registra cada navegación
 */
export default function PageViewTracker({ storeId }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    // Solo trackear si tenemos storeId válido
    if (!storeId || typeof window === 'undefined') {
      return;
    }

    // Trackear la vista de página actual
    trackPageView(storeId, pathname).catch(err => {
      console.error('[PageViewTracker] Error tracking page view:', err);
    });
  }, [storeId, pathname]);

  // Este componente no renderiza nada
  return null;
}
