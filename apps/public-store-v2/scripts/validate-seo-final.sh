#!/bin/bash
# Script de validación SEO final - Anti-duplicación

echo "🔍 VALIDACIÓN FINAL SEO - ANTI-DUPLICACIÓN"
echo "=========================================="

DOMAINS=("lunara-store.xyz" "tiendaverde.shopifree.app")

for domain in "${DOMAINS[@]}"; do
  echo ""
  echo "🌐 VALIDANDO: $domain"
  echo "----------------------------"
  
  # 1. Sitemap principal
  echo "📋 1. Sitemap principal:"
  response=$(curl -s -I "https://$domain/sitemap.xml" | head -1)
  content_type=$(curl -s -I "https://$domain/sitemap.xml" | grep -i content-type)
  echo "   Status: $response"
  echo "   Type: $content_type"
  
  # 2. Verificar que es XML válido
  echo "🔍 2. Contenido XML:"
  xml_header=$(curl -s "https://$domain/sitemap.xml" | head -1)
  echo "   Header: $xml_header"
  
  # 3. Contar URLs en sitemap
  url_count=$(curl -s "https://$domain/sitemap.xml" | grep -c "<loc>")
  echo "   URLs encontradas: $url_count"
  
  # 4. Verificar hreflang en sitemap
  echo "🌍 4. Hreflang en sitemap:"
  hreflang_count=$(curl -s "https://$domain/sitemap.xml" | grep -c "hreflang")
  echo "   Etiquetas hreflang: $hreflang_count"
  
  # 5. Robots.txt
  echo "🤖 5. Robots.txt:"
  robots_sitemap=$(curl -s "https://$domain/robots.txt" | grep Sitemap)
  echo "   $robots_sitemap"
  
  # 6. Canonical home ES
  echo "🔗 6. Canonical home ES:"
  canonical=$(curl -s "https://$domain/es/" | grep -o '<link rel="canonical"[^>]*>' | head -1)
  echo "   $canonical"
  
  # 7. Hreflang home ES
  echo "🌍 7. Hreflang home ES:"
  hreflang=$(curl -s "https://$domain/es/" | grep -o '<link rel="alternate"[^>]*hreflang[^>]*>' | head -2)
  echo "   $hreflang"
  
  # 8. Validar redirects (www)
  echo "🔄 8. Redirect www:"
  www_redirect=$(curl -s -I "https://www.$domain/" | head -1)
  echo "   WWW: $www_redirect"
  
  # 9. Validar robots en sitemap
  echo "🤖 9. Noindex en sitemap:"
  sitemap_robots=$(curl -s -I "https://$domain/sitemap.xml" | grep -i "x-robots-tag")
  echo "   $sitemap_robots"
  
  # 10. Test con User-Agent Googlebot
  echo "🕷️ 10. Test Googlebot:"
  googlebot_response=$(curl -s -I -H "User-Agent: Googlebot" "https://$domain/sitemap.xml" | head -1)
  echo "   Googlebot: $googlebot_response"
  
  echo ""
done

echo "✅ VALIDACIÓN COMPLETA"
echo ""
echo "CRITERIOS DE ÉXITO:"
echo "• Status: HTTP/1.1 200 OK"
echo "• Content-Type: application/xml"
echo "• URLs encontradas > 0"
echo "• Etiquetas hreflang > 0"
echo "• Robots.txt apunta al sitemap correcto"
echo "• Canonical apunta a versión correcta"
echo "• WWW redirige con 301"
echo "• Googlebot obtiene 200 OK"
echo ""
echo "Si todos los criterios se cumplen, ¡está listo para GSC! 🎉"
