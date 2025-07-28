export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🛍️ Shopifree
        </h1>
        <p className="text-gray-600 mb-6">
          Plataforma de comercio electrónico para crear tu tienda online
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Para acceder a una tienda específica, usa un subdominio:
          </p>
          <code className="block bg-white px-4 py-2 rounded text-sm text-gray-700">
            https://tu-tienda.shopifree.app
          </code>
          <p className="text-xs text-gray-400">
            En desarrollo local: configura el middleware con tu tienda
          </p>
        </div>
      </div>
    </div>
  )
} 