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

export default function LuxeTheme({ store, products, categories }: Props) {
  const { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = activeCategory
    ? products.filter(p => p.categoryId === activeCategory)
    : products;

  const goldColor = '#C9A962';
  const goldLight = '#E8D5A3';

  const handleWhatsAppOrder = () => {
    if (!store.whatsappNumber || items.length === 0) return;
    const orderLines = items.map(item =>
      `${item.product.name} x${item.quantity} - ${formatPrice(item.product.price * item.quantity, store.currency)}`
    ).join('\n');
    const message = `Hola, me gustaría realizar el siguiente pedido:\n\n${orderLines}\n\nTotal: ${formatPrice(totalPrice, store.currency)}`;
    const phone = store.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-[#0C0C0C]/95 backdrop-blur-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.storeName} className="h-10 brightness-0 invert" />
            ) : (
              <span className="text-2xl tracking-[0.4em] uppercase font-light" style={{ color: goldColor }}>
                {store.storeName}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 border transition-all duration-300 hover:bg-white/5"
            style={{ borderColor: `${goldColor}50` }}
          >
            <svg className="w-5 h-5" style={{ color: goldColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 text-[10px] font-sans font-bold rounded-full flex items-center justify-center text-black" style={{ backgroundColor: goldColor }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Decorative line */}
        {isScrolled && (
          <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${goldColor}40, transparent)` }} />
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C] via-transparent to-[#0C0C0C]" />

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border opacity-10 rotate-45" style={{ borderColor: goldColor }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border opacity-10 rotate-12" style={{ borderColor: goldColor }} />

        <div className="relative text-center px-6">
          {/* Crown/Diamond decoration */}
          <div className="flex justify-center mb-8">
            <svg className="w-12 h-12" style={{ color: goldColor }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L9 9H2l6 5-2 7 6-4 6 4-2-7 6-5h-7z"/>
            </svg>
          </div>

          <p className="text-xs tracking-[0.5em] uppercase mb-6" style={{ color: goldColor }}>Colección Exclusiva</p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-wider uppercase mb-6">
            {store.storeName}
          </h1>

          {store.slogan && (
            <p className="text-white/50 text-lg md:text-xl italic max-w-lg mx-auto font-light">
              {store.slogan}
            </p>
          )}

          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="w-20 h-px" style={{ backgroundColor: goldColor }} />
            <div className="w-2 h-2 rotate-45" style={{ backgroundColor: goldColor }} />
            <div className="w-20 h-px" style={{ backgroundColor: goldColor }} />
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <nav className="sticky top-16 z-40 bg-[#0C0C0C]/90 backdrop-blur-md border-y" style={{ borderColor: `${goldColor}20` }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex overflow-x-auto scrollbar-hide justify-center gap-12 py-6">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex-shrink-0 text-xs tracking-[0.3em] uppercase transition-all duration-300 pb-2 ${
                  !activeCategory ? 'border-b' : 'text-white/40 hover:text-white/70'
                }`}
                style={!activeCategory ? { color: goldColor, borderColor: goldColor } : {}}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 text-xs tracking-[0.3em] uppercase transition-all duration-300 pb-2 ${
                    activeCategory === cat.id ? 'border-b' : 'text-white/40 hover:text-white/70'
                  }`}
                  style={activeCategory === cat.id ? { color: goldColor, borderColor: goldColor } : {}}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Products */}
      <main className="max-w-7xl mx-auto px-6 py-20 pb-40">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 italic text-lg">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-6">
                  {/* Border frame */}
                  <div className="absolute inset-3 border opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" style={{ borderColor: goldColor }} />

                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <svg className="w-16 h-16 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(product);
                      }}
                      className="px-8 py-3 border text-xs tracking-[0.2em] uppercase transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:text-black"
                      style={{ borderColor: goldColor, color: goldColor }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-sm tracking-[0.15em] uppercase text-white/80 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-light" style={{ color: goldColor }}>
                    {formatPrice(product.price, store.currency)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-16" style={{ borderColor: `${goldColor}20` }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-px" style={{ backgroundColor: goldColor }} />
            <svg className="w-6 h-6" style={{ color: goldColor }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L9 9H2l6 5-2 7 6-4 6 4-2-7 6-5h-7z"/>
            </svg>
            <div className="w-12 h-px" style={{ backgroundColor: goldColor }} />
          </div>
          <p className="text-xs tracking-[0.4em] uppercase mb-6" style={{ color: goldColor }}>{store.storeName}</p>
          <a
            href="https://shopifree.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/20 text-xs hover:text-white/40 transition-colors"
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
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0C0C]/95 backdrop-blur-md border-t animate-slideUp" style={{ borderColor: `${goldColor}30` }}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-5">
              <div className="w-12 h-12 border flex items-center justify-center text-sm" style={{ borderColor: goldColor, color: goldColor }}>
                {totalItems}
              </div>
              <div className="text-left">
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/50">Tu Selección</p>
                <p className="text-xl font-light" style={{ color: goldColor }}>{formatPrice(totalPrice, store.currency)}</p>
              </div>
            </button>
            <button
              onClick={handleWhatsAppOrder}
              className="flex items-center gap-3 px-8 py-3 border text-xs tracking-[0.2em] uppercase transition-all hover:bg-white hover:text-black font-sans"
              style={{ borderColor: goldColor, color: goldColor }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Ordenar
            </button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 animate-fadeIn" onClick={() => setSelectedProduct(null)}>
          <div className="bg-[#0C0C0C] max-w-4xl w-full max-h-[90vh] overflow-auto border animate-scaleIn" style={{ borderColor: `${goldColor}30` }} onClick={(e) => e.stopPropagation()}>
            <div className="grid md:grid-cols-2">
              <div className="aspect-[3/4] md:aspect-auto bg-white/5">
                {selectedProduct.imageUrl ? (
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-20 h-20 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-10 flex flex-col">
                <button onClick={() => setSelectedProduct(null)} className="self-end text-white/30 hover:text-white transition-colors mb-8">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex-1">
                  <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: goldColor }}>{store.storeName}</p>
                  <h3 className="text-2xl md:text-3xl font-light uppercase tracking-wide mb-4">{selectedProduct.name}</h3>
                  <p className="text-2xl font-light mb-8" style={{ color: goldColor }}>{formatPrice(selectedProduct.price, store.currency)}</p>
                  {selectedProduct.description && <p className="text-white/50 italic leading-relaxed mb-8">{selectedProduct.description}</p>}
                </div>
                <button
                  onClick={() => { addItem(selectedProduct); setSelectedProduct(null); }}
                  className="w-full py-4 border text-xs tracking-[0.2em] uppercase transition-all hover:bg-white hover:text-black font-sans"
                  style={{ borderColor: goldColor, color: goldColor }}
                >
                  Agregar a la Selección
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/90 animate-fadeIn" onClick={() => setIsCartOpen(false)}>
          <div className="bg-[#0C0C0C] w-full max-w-md h-full flex flex-col border-l animate-slideLeft" style={{ borderColor: `${goldColor}30` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-8 border-b" style={{ borderColor: `${goldColor}20` }}>
              <h2 className="text-xs tracking-[0.3em] uppercase" style={{ color: goldColor }}>Tu Selección ({totalItems})</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 border flex items-center justify-center mb-6" style={{ borderColor: `${goldColor}30` }}>
                    <svg className="w-8 h-8" style={{ color: goldColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-white/30 italic">Tu selección está vacía</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-5">
                      <div className="w-20 h-24 bg-white/5 flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 font-sans">
                        <h4 className="text-xs tracking-wide uppercase text-white/70">{item.product.name}</h4>
                        <p className="text-sm mt-1" style={{ color: goldColor }}>{formatPrice(item.product.price, store.currency)}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 border text-white/50 hover:text-white transition-colors flex items-center justify-center text-xs" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>−</button>
                          <span className="w-4 text-center text-xs">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 border text-white/50 hover:text-white transition-colors flex items-center justify-center text-xs" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>+</button>
                          <button onClick={() => removeItem(item.product.id)} className="ml-auto text-white/30 hover:text-red-400 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
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
              <div className="border-t p-8 space-y-6" style={{ borderColor: `${goldColor}20` }}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">Total</span>
                  <span className="text-xl font-light" style={{ color: goldColor }}>{formatPrice(totalPrice, store.currency)}</span>
                </div>
                <button onClick={handleWhatsAppOrder} className="w-full py-4 border text-xs tracking-[0.2em] uppercase transition-all hover:bg-white hover:text-black font-sans flex items-center justify-center gap-3" style={{ borderColor: goldColor, color: goldColor }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Ordenar por WhatsApp
                </button>
                <button onClick={clearCart} className="w-full py-2 text-white/30 text-xs uppercase hover:text-white/50 transition-colors font-sans">
                  Vaciar Selección
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
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-slideLeft { animation: slideLeft 0.4s ease-out; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
