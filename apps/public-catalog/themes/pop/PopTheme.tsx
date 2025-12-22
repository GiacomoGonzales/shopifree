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

export default function PopTheme({ store, products, categories }: Props) {
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

  const colors = {
    pink: '#FF6B9D',
    purple: '#A855F7',
    blue: '#3B82F6',
    yellow: '#FBBF24',
    green: '#10B981',
    orange: '#F97316',
  };

  const primaryColor = store.primaryColor || colors.pink;

  const handleWhatsAppOrder = () => {
    if (!store.whatsappNumber || items.length === 0) return;
    const orderLines = items.map(item =>
      `${item.product.name} x${item.quantity} - ${formatPrice(item.product.price * item.quantity, store.currency)}`
    ).join('\n');
    const message = `Hola! Quiero ordenar:\n\n${orderLines}\n\nTotal: ${formatPrice(totalPrice, store.currency)}`;
    const phone = store.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getRandomColor = (index: number) => {
    const colorArray = Object.values(colors);
    return colorArray[index % colorArray.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Floating shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-20 animate-float" style={{ backgroundColor: colors.pink }} />
        <div className="absolute top-40 right-20 w-16 h-16 rounded-full opacity-20 animate-float" style={{ backgroundColor: colors.purple, animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-20 w-12 h-12 rounded-full opacity-20 animate-float" style={{ backgroundColor: colors.yellow, animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-10 w-24 h-24 rounded-full opacity-10 animate-float" style={{ backgroundColor: colors.blue, animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.storeName} className="h-10" />
            ) : (
              <span className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">
                {store.storeName}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <svg className="w-6 h-6" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce" style={{ backgroundColor: primaryColor }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-8 px-4 text-center relative">
        <div className="relative">
          {/* Stars/sparkles */}
          <div className="absolute -top-4 left-1/4 text-2xl animate-pulse">✨</div>
          <div className="absolute top-0 right-1/4 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute -bottom-2 left-1/3 text-lg animate-pulse" style={{ animationDelay: '1s' }}>🌟</div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">
              {store.storeName}
            </span>
          </h1>

          {store.slogan && (
            <p className="text-gray-500 text-lg md:text-xl max-w-md mx-auto">
              {store.slogan}
            </p>
          )}

          <div className="flex justify-center gap-2 mt-6">
            {Object.values(colors).slice(0, 5).map((color, i) => (
              <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <nav className="sticky top-14 z-40 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide gap-2 py-3">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${
                  !activeCategory ? 'text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                style={!activeCategory ? { backgroundColor: primaryColor } : {}}
              >
                Todo 🎉
              </button>
              {categories.map((cat, index) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${
                    activeCategory === cat.id ? 'text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  style={activeCategory === cat.id ? { backgroundColor: getRandomColor(index) } : {}}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Products */}
      <main className="max-w-6xl mx-auto px-4 py-8 pb-32">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎈</div>
            <p className="text-gray-400 text-lg">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <article
                key={product.id}
                className="group cursor-pointer bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 hover:rotate-1"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative aspect-square overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${getRandomColor(index)}20` }}>
                      <span className="text-5xl">📦</span>
                    </div>
                  )}

                  {/* Price tag */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-white text-sm font-bold shadow-lg transform rotate-3" style={{ backgroundColor: getRandomColor(index) }}>
                    {formatPrice(product.price, store.currency)}
                  </div>

                  {/* Add button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(product);
                    }}
                    className="absolute bottom-3 right-3 w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg transform translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    style={{ backgroundColor: getRandomColor(index) }}
                  >
                    <span className="text-2xl">+</span>
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md py-10 text-center">
        <div className="flex justify-center gap-2 mb-4">
          {Object.values(colors).map((color, i) => (
            <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
          ))}
        </div>
        <p className="font-bold text-gray-900 mb-2">{store.storeName}</p>
        <a
          href="https://shopifree.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Creado con Shopifree ✨
        </a>
      </footer>

      {/* WhatsApp Button */}
      {store.whatsappNumber && totalItems === 0 && (
        <a
          href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all animate-bounce"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}

      {/* Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-2xl rounded-t-3xl animate-slideUp">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ backgroundColor: primaryColor }}>
                {totalItems}
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400">Tu carrito 🛒</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(totalPrice, store.currency)}</p>
              </div>
            </button>
            <button
              onClick={handleWhatsAppOrder}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl text-white font-bold transition-all hover:scale-105 shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Pedir 🚀
            </button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fadeIn" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-auto animate-slideUp sm:animate-scaleIn shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100">
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">📦</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
              <p className="text-3xl font-black mb-4" style={{ color: primaryColor }}>
                {formatPrice(selectedProduct.price, store.currency)}
              </p>
              {selectedProduct.description && <p className="text-gray-500 mb-6">{selectedProduct.description}</p>}
              <div className="flex gap-3">
                <button onClick={() => setSelectedProduct(null)} className="flex-1 py-4 rounded-2xl border-2 border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                  Cerrar
                </button>
                <button onClick={() => { addItem(selectedProduct); setSelectedProduct(null); }} className="flex-1 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105" style={{ backgroundColor: primaryColor }}>
                  Agregar 🎉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:justify-end bg-black/50 animate-fadeIn" onClick={() => setIsCartOpen(false)}>
          <div className="bg-white w-full sm:w-96 sm:h-full h-[85vh] rounded-t-3xl sm:rounded-none flex flex-col animate-slideUp sm:animate-slideLeft shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">Tu Carrito 🛒</h2>
              <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-400 text-lg">Tu carrito está vacío</p>
                  <p className="text-gray-300 text-sm mt-2">Agrega productos para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.product.id} className="flex gap-4 p-4 rounded-2xl" style={{ backgroundColor: `${getRandomColor(index)}10` }}>
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${getRandomColor(index)}30` }}>
                            <span className="text-2xl">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate text-sm">{item.product.name}</h4>
                        <p className="font-bold text-sm" style={{ color: getRandomColor(index) }}>{formatPrice(item.product.price, store.currency)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-white shadow text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center text-lg font-bold">−</button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-white shadow text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center text-lg font-bold">+</button>
                          <button onClick={() => removeItem(item.product.id)} className="ml-auto text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
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
              <div className="border-t p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total</span>
                  <span className="text-3xl font-black text-gray-900">{formatPrice(totalPrice, store.currency)}</span>
                </div>
                <button onClick={handleWhatsAppOrder} className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg" style={{ backgroundColor: primaryColor }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pedir por WhatsApp 🚀
                </button>
                <button onClick={clearCart} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors">
                  Vaciar carrito
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
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.35s ease-out; }
        .animate-slideLeft { animation: slideLeft 0.35s ease-out; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
