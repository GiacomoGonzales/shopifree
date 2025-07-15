import { headers } from 'next/headers'

export default async function TestSubdomain() {
  const headersList = headers()
  const host = headersList.get('host') || 'no-host'
  
  // Extraer subdomain manualmente
  const extractSubdomain = (host: string): string | null => {
    const cleanHost = host.split(':')[0].toLowerCase()
    
    if (cleanHost === 'localhost' || cleanHost.includes('127.0.0.1')) {
      return 'lunara'
    }
    
    if (cleanHost.endsWith('.shopifree.app')) {
      const subdomain = cleanHost.replace('.shopifree.app', '')
      if (['www', 'app', 'api', 'admin', 'dashboard'].includes(subdomain)) {
        return null
      }
      return subdomain
    }
    
    if (cleanHost.endsWith('.vercel.app')) {
      return 'lunara'
    }
    
    return null
  }

  const subdomain = extractSubdomain(host)
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Test Subdomain</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Host:</strong> {host}
          </div>
          
          <div>
            <strong>Subdomain:</strong> {subdomain || 'null'}
          </div>
          
          <div>
            <strong>Environment:</strong> {process.env.NODE_ENV}
          </div>
          
          <div>
            <strong>Firebase Config:</strong>
            <ul className="ml-4 mt-2">
              <li>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</li>
              <li>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}</li>
              <li>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</li>
              <li>Storage Bucket: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing'}</li>
              <li>Messaging Sender ID: {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing'}</li>
              <li>App ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing'}</li>
            </ul>
          </div>
          
          <div>
            <strong>All Headers:</strong>
            <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
              {JSON.stringify(Object.fromEntries(headersList.entries()), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
} 