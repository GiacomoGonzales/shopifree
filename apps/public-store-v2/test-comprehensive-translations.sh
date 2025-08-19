#!/bin/bash

echo "🔍 VERIFICACIÓN COMPLETA DE TRADUCCIONES - TIENDA INGLÉS VS ESPAÑOL"
echo "================================================================="

# Función para extraer textos específicos
extract_texts() {
    local url=$1
    local store_name=$2
    
    echo ""
    echo "📍 TEXTOS DE $store_name:"
    echo "-------------------------"
    
    # Newsletter
    echo "📧 Newsletter:"
    curl -s "$url" | grep -o '<h2[^>]*nbd-newsletter-title[^>]*>[^<]*' | sed 's/.*>/- Título: /'
    curl -s "$url" | grep -o '<p[^>]*nbd-newsletter-description[^>]*>[^<]*' | sed 's/.*>/- Descripción: /'
    curl -s "$url" | grep -o 'placeholder="[^"]*"' | head -1 | sed 's/placeholder="/- Placeholder: /' | sed 's/"$//'
    
    # Botones principales  
    echo "🔗 Botones:"
    curl -s "$url" | grep -o '<span>[^<]*productos[^<]*</span>\|<span>[^<]*products[^<]*</span>' | sed 's/<span>/- /' | sed 's/<\/span>//'
    curl -s "$url" | grep -o '<span>[^<]*categories[^<]*</span>\|<span>[^<]*categorías[^<]*</span>' | sed 's/<span>/- /' | sed 's/<\/span>//'
    curl -s "$url" | grep -o '<span>[^<]*Subscribe[^<]*</span>\|<span>[^<]*Suscribirse[^<]*</span>' | sed 's/<span>/- /' | sed 's/<\/span>//'
    
    # Footer
    echo "📄 Footer:"
    curl -s "$url" | grep -o 'Navigation\|Navegación' | head -1 | sed 's/^/- /'
    curl -s "$url" | grep -o 'Contact\|Contacto' | head -1 | sed 's/^/- /'
    curl -s "$url" | grep -o 'Information\|Información' | head -1 | sed 's/^/- /'
    
    # Filtros y controles
    echo "🎛️ Controles:"
    curl -s "$url" | grep -o '<span>[^<]*Filters[^<]*</span>\|<span>[^<]*Filtros[^<]*</span>' | sed 's/<span>/- /' | sed 's/<\/span>//'
    curl -s "$url" | grep -o '<span>[^<]*Sort[^<]*</span>\|<span>[^<]*Ordenar[^<]*</span>' | sed 's/<span>/- /' | sed 's/<\/span>//'
    curl -s "$url" | grep -o '<span>[^<]*View[^<]*</span>\|<span>[^<]*Vista[^<]*</span>' | sed 's/<span>/- /' | sed 's/<\/span>//'
    
    echo ""
}

# Test tienda española
echo "🇪🇸 TIENDA ESPAÑOLA (tiendaverde.localhost:3004)"
extract_texts "http://tiendaverde.localhost:3004" "TIENDAVERDE (ES)"

# Test tienda inglesa  
echo "🇺🇸 TIENDA INGLESA (tiendaenglish.localhost:3004)"
extract_texts "http://tiendaenglish.localhost:3004" "TIENDAENGLISH (EN)"

echo ""
echo "✅ VERIFICACIÓN COMPLETA TERMINADA"
echo "=================================="
echo ""
echo "💡 PUNTOS A VERIFICAR:"
echo "- Newsletter título debe cambiar: 'Mantente al día...' vs 'Stay updated...'"
echo "- Botones deben cambiar: 'Explorar productos' vs 'Explore products'"
echo "- Footer debe cambiar: 'Navegación' vs 'Navigation'"
echo "- Controles deben cambiar: 'Filtros' vs 'Filters'"
echo ""
