/**
 * 🚀 OPTIMIZACIÓN FASE 3: Skeleton para header
 * Mejora la percepción de velocidad mostrando placeholder del header
 */

export function HeaderSkeleton() {
  return (
    <header className="bg-white shadow-sm border-b animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo placeholder */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
          </div>

          {/* Cart placeholder */}
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
        </div>
      </div>
    </header>
  );
}
