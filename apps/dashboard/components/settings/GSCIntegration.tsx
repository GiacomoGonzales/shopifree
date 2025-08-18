'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface GSCIntegrationProps {
  storeSubdomain: string;
  customDomain?: string;
  googleSearchConsole?: string;
  onUpdate: (data: { googleSearchConsole: string }) => void;
}

export default function GSCIntegration({ 
  storeSubdomain, 
  customDomain, 
  googleSearchConsole,
  onUpdate 
}: GSCIntegrationProps) {
  const t = useTranslations('settings');
  const [verificationToken, setVerificationToken] = useState(googleSearchConsole || '');
  
  // Determinar dominio canonical
  const canonicalDomain = customDomain || `${storeSubdomain}.shopifree.app`;
  const sitemapUrl = `https://${canonicalDomain}/sitemap.xml`;
  const propertyUrl = `https://${canonicalDomain}`;
  
  // URL para agregar propiedad en GSC
  const addPropertyUrl = `https://search.google.com/search-console/welcome?resource_id=${encodeURIComponent(propertyUrl)}`;
  
  // URL para enviar sitemap en GSC
  const submitSitemapUrl = `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(propertyUrl)}&sitemap_url=${encodeURIComponent(sitemapUrl)}`;
  
  const handleSave = () => {
    // Extraer solo el token, no toda la etiqueta HTML
    let cleanToken = verificationToken.trim();
    
    // Si contiene una etiqueta HTML completa, extraer el content
    if (cleanToken.includes('<meta') && cleanToken.includes('content=')) {
      const match = cleanToken.match(/content=["']([^"']+)["']/);
      if (match) {
        cleanToken = match[1];
      }
    }
    // Si contiene el prefijo google-site-verification=, removerlo
    else if (cleanToken.startsWith('google-site-verification=')) {
      cleanToken = cleanToken.replace('google-site-verification=', '');
    }
    // Si contiene .html, removerlo
    else if (cleanToken.includes('.html')) {
      cleanToken = cleanToken.replace(/^google/, '').replace(/\.html$/, '');
    }
    
    onUpdate({ googleSearchConsole: cleanToken });
  };
  
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Google Search Console
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Conecta tu tienda con Google Search Console para monitorear SEO
        </p>
      </div>
      
      {/* URL Canonical */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL de tu tienda (canonical)
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={propertyUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
          />
          <a
            href={addPropertyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
          >
            Agregar a GSC
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Usa esta URL exacta para agregar tu propiedad en Google Search Console
        </p>
      </div>
      
      {/* Sitemap URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL del Sitemap
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={sitemapUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
          />
          <a
            href={submitSitemapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
          >
            Enviar Sitemap
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Envía este sitemap a GSC después de verificar tu propiedad
        </p>
      </div>
      
      {/* Token de Verificación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Token de Verificación (opcional)
        </label>
        <input
          type="text"
          value={verificationToken}
          onChange={(e) => setVerificationToken(e.target.value)}
          placeholder="google-site-verification=TOKEN o TOKEN solamente"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Opcional: token de verificación HTML meta tag. Se recomienda usar verificación por DNS.
        </p>
      </div>
      
      {verificationToken && (
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Guardar Token de Verificación
        </button>
      )}
      
      {/* Instrucciones */}
      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          Pasos para conectar GSC:
        </h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Haz clic en "Agregar a GSC" para crear la propiedad</li>
          <li>Verifica la propiedad usando DNS (recomendado) o el token HTML</li>
          <li>Haz clic en "Enviar Sitemap" para enviar tu sitemap automático</li>
          <li>Espera unas horas para que GSC procese los datos</li>
        </ol>
      </div>
      
      {/* Estado del Sitemap */}
      <div className="bg-green-50 p-4 rounded-md">
        <h4 className="text-sm font-semibold text-green-800 mb-2">
          ✅ Tu sitemap está listo:
        </h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Incluye todas las páginas en español e inglés</li>
          <li>• Contiene etiquetas hreflang para SEO internacional</li>
          <li>• Se actualiza automáticamente cuando agregas productos/categorías</li>
          <li>• Cumple con todos los estándares de Google</li>
        </ul>
      </div>
    </div>
  );
}
