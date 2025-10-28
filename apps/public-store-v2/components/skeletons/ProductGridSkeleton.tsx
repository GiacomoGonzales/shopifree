/**
 * 🚀 OPTIMIZACIÓN FASE 3: Skeleton para grid de productos
 * Mejora la percepción de velocidad mostrando placeholders mientras carga
 */

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
          {/* Imagen placeholder */}
          <div className="aspect-square bg-gray-200" />

          {/* Contenido placeholder */}
          <div className="p-4 space-y-3">
            {/* Título */}
            <div className="h-4 bg-gray-200 rounded w-3/4" />

            {/* Precio */}
            <div className="h-5 bg-gray-200 rounded w-1/2" />

            {/* Botón */}
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
