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

export default function BoutiqueTheme({ store, products, categories }: Props) {
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

  const handleWhatsAppOrder = () => {
    if (!store.whatsappNumber || items.length === 0) return;

    const orderLines = items.map(item =>
      `${item.product.name} x${item.quantity} - ${formatPrice(item.product.price * item.quantity, store.currency)}`
    ).join('\n');

    const message = `Hola! Me gustaría ordenar:\n\n${orderLines}\n\nTotal: ${formatPrice(totalPrice, store.currency)}`;
    const phone = store.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-stone-950/95 backdrop-blur-md py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className={`transition-all duration-500 ${isScrolled ? 'text-white' : 'text-white'}`}>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.storeName} className="h-8 brightness-0 invert" />
            ) : (
              <span className="text-xl tracking-[0.3em] uppercase font-light">
                {store.storeName}
              </span>
            )}
          </div>

          {/* Cart button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative text-white hover:opacity-70 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-600 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] bg-stone-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-transparent to-stone-950/80" />
        <div className="relative text-center text-white px-6">
          <div className="w-16 h-px bg-amber-600 mx-auto mb-8" />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.2em] uppercase mb-6">
            {store.storeName}
          </h1>
          {store.slogan && (
            <p className="text-stone-400 text-lg md:text-xl font-light italic tracking-wide max-w-xl mx-auto">
              {store.slogan}
            </p>
          )}
          <div className="w-16 h-px bg-amber-600 mx-auto mt-8" />
        </div>
      </section>

      {/* Categories Navigation */}
      {categories.length > 0 && (
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex overflow-x-auto scrollbar-hide justify-center gap-8 py-5">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex-shrink-0 text-xs tracking-[0.25em] uppercase transition-all duration-300 pb-1 ${
                  !activeCategory
                    ? 'text-stone-900 border-b border-stone-900'
                    : 'text-stone-400 hover:text-stone-600 border-b border-transparent'
                }`}
              >
                Colección
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 text-xs tracking-[0.25em] uppercase transition-all duration-300 pb-1 ${
                    activeCategory === cat.id
                      ? 'text-stone-900 border-b border-stone-900'
                      : 'text-stone-400 hover:text-stone-600 border-b border-transparent'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-400 italic text-lg">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-12">
            {filteredProducts.map((product, index) => (
              <article
                key={product.id}
                className="group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden mb-5">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Quick Add Overlay */}
                  <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/40 transition-all duration-500 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(product);
                      }}
                      className="bg-white text-stone-900 px-6 py-3 text-xs tracking-[0.2em] uppercase transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-amber-600 hover:text-white"
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="text-center space-y-2">
                  <h3 className="text-xs tracking-[0.15em] uppercase text-stone-600 group-hover:text-stone-900 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-lg font-light text-stone-900">
                    {formatPrice(product.price, store.currency)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="w-12 h-px bg-amber-600 mx-auto mb-8" />
          <p className="text-xs tracking-[0.3em] uppercase mb-6">{store.storeName}</p>
          <a
            href="https://shopifree.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-500 text-xs hover:text-stone-300 transition-colors"
          >
            Creado con Shopifree
          </a>
        </div>
      </footer>

      {/* WhatsApp Floating Button - Only when cart is empty */}
      {store.whatsappNumber && totalItems === 0 && (
        <a
          href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}

      {/* Cart Bar - Fixed at bottom when cart has items */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950 text-white animate-slideUp">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 border border-stone-700 flex items-center justify-center">
                <span className="text-sm">{totalItems}</span>
              </div>
              <div className="text-left">
                <p className="text-xs text-stone-400 uppercase tracking-wider">Tu selección</p>
                <p className="text-lg font-light">{formatPrice(totalPrice, store.currency)}</p>
              </div>
            </button>
            <button
              onClick={handleWhatsAppOrder}
              className="flex items-center gap-3 bg-amber-600 hover:bg-amber-500 px-6 py-3 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-xs tracking-[0.15em] uppercase">Pedir por WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 animate-fadeIn"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="aspect-[3/4] md:aspect-auto md:h-full bg-stone-100">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-20 h-20 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-8 md:p-12 flex flex-col">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="self-end text-stone-400 hover:text-stone-900 transition-colors mb-8"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex-1">
                  <h2 className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-3">
                    {store.storeName}
                  </h2>
                  <h3 className="text-2xl md:text-3xl font-light text-stone-900 mb-4">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-2xl font-light text-stone-900 mb-6">
                    {formatPrice(selectedProduct.price, store.currency)}
                  </p>

                  {selectedProduct.description && (
                    <div className="border-t border-stone-200 pt-6 mb-8">
                      <p className="text-stone-600 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    addItem(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full py-4 bg-stone-950 text-white text-xs tracking-[0.2em] uppercase hover:bg-amber-600 transition-colors"
                >
                  Agregar a la selección
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-stone-950/80 animate-fadeIn"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md h-full flex flex-col animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="text-xs tracking-[0.2em] uppercase">Tu Selección ({totalItems})</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-stone-400 hover:text-stone-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <svg className="w-16 h-16 text-stone-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-stone-400 italic">Tu selección está vacía</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="w-20 h-24 bg-stone-100 flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs tracking-wider uppercase text-stone-600">
                          {item.product.name}
                        </h4>
                        <p className="text-stone-900 mt-1">
                          {formatPrice(item.product.price, store.currency)}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors flex items-center justify-center"
                          >
                            <span className="text-xs">−</span>
                          </button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors flex items-center justify-center"
                          >
                            <span className="text-xs">+</span>
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto text-stone-400 hover:text-red-600 transition-colors"
                          >
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

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-stone-200 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs tracking-[0.15em] uppercase text-stone-500">Total</span>
                  <span className="text-xl font-light">{formatPrice(totalPrice, store.currency)}</span>
                </div>
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-4 bg-stone-950 text-white text-xs tracking-[0.2em] uppercase hover:bg-amber-600 transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pedir por WhatsApp
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-stone-400 text-xs tracking-wider uppercase hover:text-stone-900 transition-colors"
                >
                  Vaciar selección
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        .animate-slideLeft {
          animation: slideLeft 0.4s ease-out;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
