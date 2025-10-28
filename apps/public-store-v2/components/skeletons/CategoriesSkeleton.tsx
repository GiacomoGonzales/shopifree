/**
 * 🚀 OPTIMIZACIÓN FASE 3: Skeleton para categorías
 * Mejora la percepción de velocidad mostrando placeholder de categorías
 */

export function CategoriesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          {/* Imagen circular */}
          <div className="aspect-square rounded-full bg-gray-200 mb-2" />
          {/* Texto */}
          <div className="h-4 bg-gray-200 rounded mx-auto w-3/4" />
        </div>
      ))}
    </div>
  );
}
