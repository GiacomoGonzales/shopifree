'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * QueryProvider - Wrapper para React Query
 *
 * Configuración optimizada:
 * - staleTime: 5 minutos - Los datos se consideran frescos durante 5 min
 * - cacheTime: 10 minutos - Los datos en cache se mantienen 10 min
 * - refetchOnWindowFocus: false - No re-fetching al volver a la ventana
 * - retry: 1 - Solo 1 reintento en caso de error
 */
export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutos
                gcTime: 10 * 60 * 1000, // 10 minutos (antes se llamaba cacheTime)
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
