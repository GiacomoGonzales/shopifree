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

export default function NeonTheme({ store, products, categories }: Props) {
  const { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = activeCategory
    ? products.filter(p => p.categoryId === activeCategory)
    : products;

  const neonColor = store.primaryColor || '#00ff88';
  const neonPink = '#ff00ff';
  const neonBlue = '#00ffff';

  const handleWhatsAppOrder = () => {
    if (!store.whatsappNumber || items.length === 0) return;
    const orderLines = items.map(item =>
      `${item.product.name} x${item.quantity} - ${formatPrice(item.product.price * item.quantity, store.currency)}`
    ).join('\n');
    const message = `Hola! Quiero ordenar:\n\n${orderLines}\n\nTotal: ${formatPrice(totalPrice, store.currency)}`;
    const phone = store.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[150px] opacity-30 animate-pulse" style={{ backgroundColor: neonPink }} />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ backgroundColor: neonBlue, animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full blur-[100px] opacity-25 animate-pulse" style={{ backgroundColor: neonColor, animationDelay: '2s' }} />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `linear-gradient(${neonColor}22 1px, transparent 1px), linear-gradient(90deg, ${neonColor}22 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b' : 'bg-transparent'
      }`} style={{ borderColor: isScrolled ? `${neonColor}30` : 'transparent' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="relative">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.storeName} className="h-10" />
            ) : (
              <span className="text-2xl font-bold tracking-wider" style={{
                color: neonColor,
                textShadow: `0 0 10px ${neonColor}, 0 0 20px ${neonColor}, 0 0 40px ${neonColor}`
              }}>
                {store.storeName}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-lg border transition-all hover:scale-105"
            style={{
              borderColor: `${neonColor}50`,
              boxShadow: totalItems > 0 ? `0 0 15px ${neonColor}50, inset 0 0 15px ${neonColor}20` : 'none'
            }}
          >
            <svg className="w-6 h-6" style={{ color: neonColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 text-black text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: neonColor }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 text-center">
        <div className="relative">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight mb-4" style={{
            background: `linear-gradient(135deg, ${neonColor}, ${neonBlue}, ${neonPink})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `0 0 60px ${neonColor}40`
          }}>
            {store.storeName}
          </h1>
          {store.slogan && (
            <p className="text-white/50 text-lg md:text-xl max-w-md mx-auto">
              {store.slogan}
            </p>
          )}
          <div className="w-32 h-1 mx-auto mt-8 rounded-full" style={{
            background: `linear-gradient(90deg, transparent, ${neonColor}, transparent)`,
            boxShadow: `0 0 20px ${neonColor}`
          }} />
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <nav className="sticky top-16 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-y" style={{ borderColor: `${neonColor}20` }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide gap-3 py-4">
              <button
                onClick={() => setActiveCategory(null)}
                className="flex-shrink-0 px-6 py-2.5 rounded-lg text-sm font-medium uppercase tracking-wider transition-all"
                style={!activeCategory ? {
                  backgroundColor: `${neonColor}20`,
                  color: neonColor,
                  boxShadow: `0 0 20px ${neonColor}40, inset 0 0 20px ${neonColor}10`,
                  border: `1px solid ${neonColor}`
                } : {
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)'
                }}
              >
                Todo
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex-shrink-0 px-6 py-2.5 rounded-lg text-sm font-medium uppercase tracking-wider transition-all"
                  style={activeCategory === cat.id ? {
                    backgroundColor: `${neonColor}20`,
                    color: neonColor,
                    boxShadow: `0 0 20px ${neonColor}40, inset 0 0 20px ${neonColor}10`,
                    border: `1px solid ${neonColor}`
                  } : {
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)'
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
      <main className="relative max-w-7xl mx-auto px-4 py-12 pb-32">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group cursor-pointer relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" style={{
                  boxShadow: `0 0 30px ${neonColor}30, inset 0 0 30px ${neonColor}10`,
                  border: `1px solid ${neonColor}50`
                }} />

                <div className="relative aspect-square overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(product);
                    }}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-lg flex items-center justify-center transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                    style={{
                      backgroundColor: neonColor,
                      boxShadow: `0 0 20px ${neonColor}`
                    }}
                  >
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-white/90 truncate mb-1">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold" style={{ color: neonColor }}>
                    {formatPrice(product.price, store.currency)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t py-12" style={{ borderColor: `${neonColor}20` }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-2xl font-bold mb-4" style={{
            color: neonColor,
            textShadow: `0 0 10px ${neonColor}`
          }}>
            {store.storeName}
          </p>
          <a
            href="https://shopifree.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 text-xs hover:text-white/50 transition-colors"
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
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all"
          style={{ boxShadow: '0 0 30px rgba(37, 211, 102, 0.5)' }}
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}

      {/* Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 animate-slideUp border-t" style={{
          backgroundColor: 'rgba(10,10,15,0.95)',
          backdropFilter: 'blur(20px)',
          borderColor: `${neonColor}30`
        }}>
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold" style={{
                backgroundColor: `${neonColor}20`,
                color: neonColor,
                boxShadow: `0 0 15px ${neonColor}40`
              }}>
                {totalItems}
              </div>
              <div className="text-left">
                <p className="text-xs text-white/50 uppercase tracking-wider">Tu carrito</p>
                <p className="text-xl font-bold" style={{ color: neonColor }}>{formatPrice(totalPrice, store.currency)}</p>
              </div>
            </button>
            <button
              onClick={handleWhatsAppOrder}
              className="flex items-center gap-3 px-6 py-3 rounded-lg font-bold uppercase text-sm tracking-wide text-black transition-all hover:scale-105"
              style={{
                backgroundColor: neonColor,
                boxShadow: `0 0 25px ${neonColor}`
              }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn" onClick={() => setSelectedProduct(null)}>
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-auto rounded-2xl animate-scaleIn" style={{ backgroundColor: '#0a0a0f', border: `1px solid ${neonColor}30` }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="aspect-square bg-white/5">
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">{selectedProduct.name}</h3>
              <p className="text-3xl font-bold mb-4" style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }}>
                {formatPrice(selectedProduct.price, store.currency)}
              </p>
              {selectedProduct.description && <p className="text-white/60 mb-6">{selectedProduct.description}</p>}
              <button
                onClick={() => { addItem(selectedProduct); setSelectedProduct(null); }}
                className="w-full py-4 rounded-lg font-bold uppercase tracking-wide text-black transition-all hover:scale-[1.02]"
                style={{ backgroundColor: neonColor, boxShadow: `0 0 25px ${neonColor}` }}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 animate-fadeIn" onClick={() => setIsCartOpen(false)}>
          <div className="w-full max-w-md h-full flex flex-col animate-slideLeft" style={{ backgroundColor: '#0a0a0f', borderLeft: `1px solid ${neonColor}30` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: `${neonColor}20` }}>
              <h2 className="text-lg font-bold">Carrito ({totalItems})</h2>
              <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${neonColor}20` }}>
                    <svg className="w-10 h-10" style={{ color: neonColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-white/40">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white/90 truncate text-sm">{item.product.name}</h4>
                        <p className="font-bold text-sm" style={{ color: neonColor }}>{formatPrice(item.product.price, store.currency)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center text-sm">−</button>
                          <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center text-sm">+</button>
                          <button onClick={() => removeItem(item.product.id)} className="ml-auto text-white/40 hover:text-red-500 transition-colors">
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
              <div className="border-t p-6 space-y-4" style={{ borderColor: `${neonColor}20` }}>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 uppercase text-sm">Total</span>
                  <span className="text-2xl font-bold" style={{ color: neonColor }}>{formatPrice(totalPrice, store.currency)}</span>
                </div>
                <button onClick={handleWhatsAppOrder} className="w-full py-4 rounded-lg font-bold uppercase tracking-wide text-black flex items-center justify-center gap-3" style={{ backgroundColor: neonColor, boxShadow: `0 0 25px ${neonColor}` }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pedir por WhatsApp
                </button>
                <button onClick={clearCart} className="w-full py-2 text-white/40 text-sm uppercase hover:text-white/60 transition-colors">Vaciar carrito</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-slideLeft { animation: slideLeft 0.3s ease-out; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
