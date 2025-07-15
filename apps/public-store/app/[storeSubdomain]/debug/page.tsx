import { headers } from 'next/headers'

interface PageProps {
  params: {
    storeSubdomain: string
  }
}

export default async function DebugPage({ params }: PageProps) {
  const headersList = headers()
  const host = headersList.get('host') || 'no-host'
  
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Debug - Store Subdomain Route</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Host:</strong> {host}
          </div>
          
          <div>
            <strong>Params.storeSubdomain:</strong> {params.storeSubdomain}
          </div>
          
          <div>
            <strong>Environment:</strong> {process.env.NODE_ENV}
          </div>
          
          <div>
            <strong>Route:</strong> /[storeSubdomain]/debug/page.tsx
          </div>
          
          <div>
            <strong>All Headers:</strong>
            <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
              {JSON.stringify(Object.fromEntries(headersList.entries()), null, 2)}
            </pre>
          </div>
          
          <div className="mt-6">
            <a 
              href="/" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
            >
              Go to Store Home
            </a>
            <a 
              href="/debug" 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Refresh Debug
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 