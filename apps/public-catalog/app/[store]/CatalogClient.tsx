'use client';

import { CartProvider } from '@/lib/cart';
import { Store, Product, Category } from '@/lib/store';
import MinimalTheme from '@/themes/minimal/MinimalTheme';
import BoutiqueTheme from '@/themes/boutique/BoutiqueTheme';
import BoldTheme from '@/themes/bold/BoldTheme';
import FreshTheme from '@/themes/fresh/FreshTheme';
import NeonTheme from '@/themes/neon/NeonTheme';
import LuxeTheme from '@/themes/luxe/LuxeTheme';
import CraftTheme from '@/themes/craft/CraftTheme';
import PopTheme from '@/themes/pop/PopTheme';

interface Props {
  store: Store;
  products: Product[];
  categories: Category[];
}

// Map of available catalog themes
const themes: Record<string, React.ComponentType<{ store: Store; products: Product[]; categories: Category[] }>> = {
  minimal: MinimalTheme,
  boutique: BoutiqueTheme,
  bold: BoldTheme,
  fresh: FreshTheme,
  neon: NeonTheme,
  luxe: LuxeTheme,
  craft: CraftTheme,
  pop: PopTheme,
};

export default function CatalogClient({ store, products, categories }: Props) {
  // Get theme component or default to minimal
  const themeId = store.theme || 'minimal';
  const ThemeComponent = themes[themeId] || MinimalTheme;

  return (
    <CartProvider>
      <ThemeComponent
        store={store}
        products={products}
        categories={categories}
      />
    </CartProvider>
  );
}
