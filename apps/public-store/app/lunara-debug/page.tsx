import { getStoreBySubdomain, transformStoreForClient } from '../../lib/store'
import { headers } from 'next/headers'

export default async function LunaraStorePage() {
  const headersList = headers()
  const host = headersList.get('host') || 'localhost'
  
  let storeData = null
  let error = null
  
  try {
    // Intentar obtener datos de la tienda
    const rawStore = await getStoreBySubdomain('lunara')
    storeData = transformStoreForClient(rawStore)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error loading store:', err)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Lunara Store - Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Connection Info</h2>
            <div className="space-y-2">
              <p><strong>Host:</strong> {host}</p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Firebase Config</h2>
            <div className="space-y-2 text-sm">
              <p>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</p>
              <p>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}</p>
              <p>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</p>
              <p>Storage Bucket: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing'}</p>
              <p>Messaging Sender ID: {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing'}</p>
              <p>App ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing'}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Store Data</h2>
          
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-800 font-medium">Error loading store data:</h3>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          ) : storeData ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-green-800 font-medium">Store loaded successfully:</h3>
              <div className="mt-2 space-y-2">
                <p><strong>Name:</strong> {storeData.storeName}</p>
                <p><strong>Subdomain:</strong> {storeData.subdomain}</p>
                <p><strong>Description:</strong> {storeData.description}</p>
                <p><strong>Currency:</strong> {storeData.currency}</p>
                <p><strong>Theme:</strong> {storeData.theme}</p>
                <p><strong>Owner ID:</strong> {storeData.ownerId}</p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">Loading store data...</p>
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <a 
              href="/test-subdomain" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Subdomain
            </a>
            <a 
              href="/" 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 