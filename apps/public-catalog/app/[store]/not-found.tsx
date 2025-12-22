export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-light text-gray-300 mb-4">404</h1>
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          Catalogo no encontrado
        </h2>
        <p className="text-gray-500 mb-6">
          El catalogo que buscas no existe o ha sido eliminado.
        </p>
        <a
          href="https://shopifree.app"
          className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
        >
          Crear mi catalogo gratis
        </a>
      </div>
    </main>
  );
}
