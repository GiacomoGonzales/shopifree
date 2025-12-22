'use client';

import { useState, useEffect } from 'react';
import { Store, Product, Category } from '@/lib/store';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/lib/cart';

interface Props {
  store: Store;
  products: Product[];
  categories: Category[];
}

export default function CraftTheme({ store, products, categories }: Props) {
  const { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = activeCategory
    ? products.filter(p => p.categoryId === activeCategory)
    : products;

  const craftColor = store.primaryColor || '#B45309';
  const beigeLight = '#FAF5F0';
  const beigeMedium = '#E8DDD4';

  const handleWhatsAppOrder = () => {
    if (!store.whatsappNumber || items.length === 0) return;
    const orderLines = items.map(item =>
      `${item.product.name} x${item.quantity} - ${formatPrice(item.product.price * item.quantity, store.currency)}`
    ).join('\n');
    const message = `Hola! Me interesa ordenar:\n\n${orderLines}\n\nTotal: ${formatPrice(totalPrice, store.currency)}`;
    const phone = store.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: beigeLight }}>
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#FAF5F0]/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.storeName} className="h-12" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center" style={{ borderColor: craftColor }}>
                  <svg className="w-5 h-5" style={{ color: craftColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <span className="text-xl font-serif" style={{ color: craftColor }}>
                  {store.storeName}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-full border-2 transition-all hover:scale-105"
            style={{ borderColor: beigeMedium, backgroundColor: 'white' }}
          >
            <svg className="w-5 h-5" style={{ color: craftColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: craftColor }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: craftColor }} />
            <svg className="w-5 h-5" style={{ color: craftColor }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <div className="w-8 h-px" style={{ backgroundColor: craftColor }} />
          </div>
        </div>

        <p className="text-sm tracking-widest uppercase mb-4" style={{ color: craftColor }}>Hecho con amor</p>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4" style={{ color: '#3D2314' }}>
          {store.storeName}
        </h1>

        {store.slogan && (
          <p className="text-gray-500 text-lg max-w-md mx-auto italic">{store.slogan}</p>
        )}

        <div className="flex justify-center mt-8">
          <div className="w-24 h-1 rounded-full" style={{ backgroundColor: beigeMedium }} />
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <nav className="sticky top-16 z-40 bg-[#FAF5F0]/90 backdrop-blur-md border-y" style={{ borderColor: beigeMedium }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide gap-2 py-4 justify-center">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-medium transition-all border-2 ${
                  !activeCategory ? 'text-white' : 'bg-white hover:border-current'
                }`}
                style={{
                  backgroundColor: !activeCategory ? craftColor : 'white',
                  borderColor: !activeCategory ? craftColor : beigeMedium,
                  color: !activeCategory ? 'white' : '#6B5B50'
                }}
              >
                Todo
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-medium transition-all border-2 ${
                    activeCategory === cat.id ? 'text-white' : 'bg-white hover:border-current'
                  }`}
                  style={{
                    backgroundColor: activeCategory === cat.id ? craftColor : 'white',
                    borderColor: activeCategory === cat.id ? craftColor : beigeMedium,
                    color: activeCategory === cat.id ? 'white' : '#6B5B50'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Products */}
      <main className="max-w-6xl mx-auto px-4 py-12 pb-32">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: beigeMedium }}>
              <svg className="w-8 h-8" style={{ color: craftColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-400 italic">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border-2" style={{ borderColor: beigeMedium, backgroundColor: 'white' }}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: beigeMedium }}>
                      <svg className="w-12 h-12" style={{ color: `${craftColor}40` }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Handmade badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: craftColor }}>
                    Artesanal
                  </div>

                  {/* Add button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(product);
                    }}
                    className="absolute bottom-3 right-3 w-11 h-11 rounded-full text-white flex items-center justify-center shadow-lg transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ backgroundColor: craftColor }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div className="text-center">
                  <h3 className="font-serif text-lg mb-1" style={{ color: '#3D2314' }}>
                    {product.name}
                  </h3>
                  <p className="text-lg font-semibold" style={{ color: craftColor }}>
                    {formatPrice(product.price, store.currency)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: beigeMedium }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{ borderColor: craftColor }}>
              <svg className="w-6 h-6" style={{ color: craftColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
          </div>
          <p className="font-serif text-lg mb-2" style={{ color: '#3D2314' }}>{store.storeName}</p>
          <p className="text-sm text-gray-400 mb-4">Hecho a mano con amor</p>
          <a
            href="https://shopifree.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline"
            style={{ color: craftColor }}
          >
            Creado con Shopifree
          </a>
        </div>
      </footer>

      {/* WhatsApp Button */}
      {store.whatsappNumber && totalItems === 0 && (
        <a
          href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}

      {/* Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 shadow-2xl animate-slideUp" style={{ borderColor: beigeMedium }}>
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: craftColor }}>
                {totalItems}
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400">Tu canasta</p>
                <p className="text-lg font-serif font-semibold" style={{ color: '#3D2314' }}>{formatPrice(totalPrice, store.currency)}</p>
              </div>
            </button>
            <button
              onClick={handleWhatsAppOrder}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ backgroundColor: craftColor }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Pedir
            </button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fadeIn" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-auto animate-slideUp sm:animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: beigeMedium }} />
            </div>
            <div className="aspect-square" style={{ backgroundColor: beigeMedium }}>
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24" style={{ color: `${craftColor}40` }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-4" style={{ backgroundColor: craftColor }}>
                Artesanal
              </div>
              <h3 className="text-2xl font-serif mb-2" style={{ color: '#3D2314' }}>{selectedProduct.name}</h3>
              <p className="text-2xl font-bold mb-4" style={{ color: craftColor }}>{formatPrice(selectedProduct.price, store.currency)}</p>
              {selectedProduct.description && <p className="text-gray-500 mb-6 leading-relaxed">{selectedProduct.description}</p>}
              <div className="flex gap-3">
                <button onClick={() => setSelectedProduct(null)} className="flex-1 py-4 rounded-full border-2 font-medium text-gray-500 hover:bg-gray-50 transition-colors" style={{ borderColor: beigeMedium }}>
                  Cerrar
                </button>
                <button onClick={() => { addItem(selectedProduct); setSelectedProduct(null); }} className="flex-1 py-4 rounded-full font-medium text-white transition-all hover:opacity-90" style={{ backgroundColor: craftColor }}>
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:justify-end bg-black/50 animate-fadeIn" onClick={() => setIsCartOpen(false)}>
          <div className="bg-white w-full sm:w-96 sm:h-full h-[85vh] rounded-t-3xl sm:rounded-none flex flex-col animate-slideUp sm:animate-slideLeft" onClick={(e) => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: beigeMedium }} />
            </div>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: beigeMedium }}>
              <h2 className="text-lg font-serif" style={{ color: '#3D2314' }}>Tu Canasta ({totalItems})</h2>
              <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: beigeMedium }}>
                    <svg className="w-10 h-10" style={{ color: craftColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 italic">Tu canasta está vacía</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-4 p-3 rounded-xl" style={{ backgroundColor: beigeLight }}>
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: beigeMedium }}>
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6" style={{ color: `${craftColor}40` }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm" style={{ color: '#3D2314' }}>{item.product.name}</h4>
                        <p className="font-semibold text-sm" style={{ color: craftColor }}>{formatPrice(item.product.price, store.currency)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center text-sm" style={{ borderColor: beigeMedium }}>−</button>
                          <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-full border flex items-center justify-center text-sm" style={{ borderColor: beigeMedium }}>+</button>
                          <button onClick={() => removeItem(item.product.id)} className="ml-auto text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t p-5 space-y-4" style={{ borderColor: beigeMedium }}>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total</span>
                  <span className="text-2xl font-serif font-bold" style={{ color: '#3D2314' }}>{formatPrice(totalPrice, store.currency)}</span>
                </div>
                <button onClick={handleWhatsAppOrder} className="w-full py-4 rounded-full font-medium text-white flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ backgroundColor: craftColor }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pedir por WhatsApp
                </button>
                <button onClick={clearCart} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors">
                  Vaciar canasta
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.35s ease-out; }
        .animate-slideLeft { animation: slideLeft 0.35s ease-out; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
