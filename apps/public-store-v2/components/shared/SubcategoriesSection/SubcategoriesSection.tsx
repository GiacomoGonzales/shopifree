import { useEffect, useState } from 'react'

interface Subcategory {
  id: string
  slug: string
  name: string
}

interface SubcategoriesSectionProps {
  isOnCategoryPage: boolean
  currentCategory?: { name: string } | null
  subcategories: Subcategory[]
  selectedSubcategory: string | null
  setSelectedSubcategory: (slug: string | null) => void
}

export function SubcategoriesSection({
  isOnCategoryPage,
  currentCategory,
  subcategories,
  selectedSubcategory,
  setSelectedSubcategory
}: SubcategoriesSectionProps) {
  const [primaryColor, setPrimaryColor] = useState<string>('#000000');

  // Obtener color primario dinámico (igual que SimpleVariantSelector)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getPrimaryColor = () => {
      const color = getComputedStyle(document.documentElement).getPropertyValue('--nbd-primary');
      if (color && color.trim() && color.trim() !== '') {
        setPrimaryColor(color.trim());
        console.log('🎨 [SubcategoriesSection] Color primario obtenido:', color.trim());
        return true;
      }
      return false;
    };

    // Intentar inmediatamente
    if (!getPrimaryColor()) {
      // Si no funciona, reintentar cada 100ms hasta 3 segundos
      let attempts = 0;
      const maxAttempts = 30;

      const intervalId = setInterval(() => {
        attempts++;
        if (getPrimaryColor() || attempts >= maxAttempts) {
          clearInterval(intervalId);
          if (attempts >= maxAttempts) {
            console.warn('🎨 [SubcategoriesSection] No se pudo obtener color primario, usando fallback');
          }
        }
      }, 100);

      return () => clearInterval(intervalId);
    }
  }, []);

  // Solo renderizar si estamos en página de categoría, hay categoría actual y hay subcategorías
  const shouldRender = isOnCategoryPage && currentCategory && subcategories.length > 0;

  if (!shouldRender) return null;

  return (
    <section className="nbd-subcategories-section">
      <div className="nbd-container">
        <div className="nbd-subcategories-grid">
          {/* Botón "Todas" para mostrar todos los productos */}
          <button
            onClick={() => setSelectedSubcategory(null)}
            className="nbd-subcategory-button"
            style={{
              background: !selectedSubcategory ? primaryColor : '#f5f5f5',
              borderColor: !selectedSubcategory ? primaryColor : '#e0e0e0',
              color: !selectedSubcategory ? '#ffffff' : '#666666'
            }}
          >
            <span className="nbd-subcategory-name">Todas</span>
          </button>

          {/* Botones de subcategorías */}
          {subcategories.map((subcategory) => {
            const isSelected = selectedSubcategory === subcategory.slug;
            return (
              <button
                key={subcategory.id}
                onClick={() => setSelectedSubcategory(subcategory.slug)}
                className="nbd-subcategory-button"
                style={{
                  background: isSelected ? primaryColor : '#f5f5f5',
                  borderColor: isSelected ? primaryColor : '#e0e0e0',
                  color: isSelected ? '#ffffff' : '#666666'
                }}
              >
                <span className="nbd-subcategory-name">{subcategory.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  )
}