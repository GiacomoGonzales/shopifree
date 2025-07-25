import { getStoreBySubdomain, transformStoreForClient } from '../../lib/store'
import { getStoreProducts } from '../../lib/products'
import { getStoreCategories } from '../../lib/categories'

export default async function DebugStorePage() {
  let storeData = null
  let products = []
  let categories = []
  let error = null
  
  try {
    // Intentar obtener datos de la tienda lunara
    console.log('🔍 Buscando tienda lunara...')
    const rawStore = await getStoreBySubdomain('lunara')
    console.log('📦 Raw store data:', rawStore)
    
    if (rawStore) {
      storeData = transformStoreForClient(rawStore)
      console.log('✅ Store data transformed:', storeData)
      
      // Intentar obtener productos
      try {
        console.log('🛍️ Buscando productos para store ID:', storeData.id)
        products = await getStoreProducts(storeData.id)
        console.log('📦 Products found:', products.length)
      } catch (prodError) {
        console.error('❌ Error loading products:', prodError)
      }
      
      // Intentar obtener categorías
      try {
        console.log('📂 Buscando categorías para store ID:', storeData.id)
        categories = await getStoreCategories(storeData.id)
        console.log('📂 Categories found:', categories.length)
      } catch (catError) {
        console.error('❌ Error loading categories:', catError)
      }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
    console.error('💥 Error loading store:', err)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Store Debug - Lunara</h1>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h3 className="text-red-800 font-medium">❌ Error loading store:</h3>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        ) : storeData ? (
          <div className="space-y-6">
            {/* Store Info */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-green-800 font-medium mb-2">✅ Store loaded successfully</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {storeData.storeName}</div>
                <div><strong>ID:</strong> {storeData.id}</div>
                <div><strong>Subdomain:</strong> {storeData.subdomain}</div>
                <div><strong>Theme:</strong> {storeData.theme}</div>
                <div><strong>Currency:</strong> {storeData.currency}</div>
                <div><strong>Owner ID:</strong> {storeData.ownerId}</div>
              </div>
            </div>
            
            {/* Products Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-blue-800 font-medium mb-2">🛍️ Products ({products.length})</h3>
              {products.length > 0 ? (
                <div className="space-y-2">
                  {products.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="text-sm p-2 bg-white rounded border">
                      <div><strong>#{index + 1}:</strong> {product.name}</div>
                      <div><strong>ID:</strong> {product.id}</div>
                      <div><strong>Price:</strong> {product.price} {product.currency}</div>
                      <div><strong>Status:</strong> {product.status}</div>
                    </div>
                  ))}
                  {products.length > 5 && (
                    <div className="text-sm text-blue-600">... y {products.length - 5} productos más</div>
                  )}
                </div>
              ) : (
                <p className="text-blue-700">No products found for this store</p>
              )}
            </div>
            
            {/* Categories Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <h3 className="text-purple-800 font-medium mb-2">📂 Categories ({categories.length})</h3>
              {categories.length > 0 ? (
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div key={category.id} className="text-sm p-2 bg-white rounded border">
                      <div><strong>#{index + 1}:</strong> {category.name}</div>
                      <div><strong>ID:</strong> {category.id}</div>
                      <div><strong>Slug:</strong> {category.slug}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-purple-700">No categories found for this store</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">❌ Store 'lunara' not found in database</p>
          </div>
        )}
        
        <div className="mt-8 space-x-4">
          <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Try Store Home
          </a>
          <a href="/lunara-debug" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Lunara Debug
          </a>
          <a href="/test-subdomain" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            Test Subdomain
          </a>
        </div>
      </div>
    </div>
  )
} 