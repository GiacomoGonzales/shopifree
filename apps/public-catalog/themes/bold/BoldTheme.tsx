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

export default function BoldTheme({ store, products, categories }: Props) {
  const { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = activeCategory
    ? products.filter(p => p.categoryId === activeCategory)
    : products;

  const primaryColor = store.primaryColor || '#FBBF24';

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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.storeName} className="h-10" />
            ) : (
              <span
                className="text-2xl md:text-3xl font-black uppercase tracking-tighter"
                style={{ color: primaryColor }}
              >
                {store.storeName}
              </span>
            )}
          </div>

          {/* Cart button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative group"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: primaryColor }}
            >
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-black text-xs font-black rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        <div className="relative text-center px-4">
          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none mb-6"
            style={{ color: primaryColor }}
          >
            {store.storeName}
          </h1>
          {store.slogan && (
            <p className="text-white/60 text-lg md:text-xl max-w-md mx-auto">
              {store.slogan}
            </p>
          )}
          <div
            className="w-24 h-1 mx-auto mt-8"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <nav className="sticky top-16 z-40 bg-black/90 backdrop-blur-sm border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide gap-2 py-4">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex-shrink-0 px-6 py-3 font-bold uppercase text-sm tracking-wide transition-all ${
                  !activeCategory ? 'text-black' : 'text-white/60 hover:text-white border border-white/20'
                }`}
                style={!activeCategory ? { backgroundColor: primaryColor } : {}}
              >
                Todo
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-6 py-3 font-bold uppercase text-sm tracking-wide transition-all ${
                    activeCategory === cat.id ? 'text-black' : 'text-white/60 hover:text-white border border-white/20'
                  }`}
                  style={activeCategory === cat.id ? { backgroundColor: primaryColor } : {}}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12 pb-32">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group cursor-pointer relative overflow-hidden"
                onClick={() => setSelectedProduct(product)}
              >
                {/* Image */}
                <div className="relative aspect-square bg-white/5 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(product);
                      }}
                      className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 px-6 py-3 font-bold uppercase text-sm tracking-wide text-black"
                      style={{ backgroundColor: primaryColor }}
                    >
                      + Agregar
                    </button>
                  </div>

                  {/* Price tag */}
                  <div
                    className="absolute bottom-0 left-0 px-3 py-2 font-black text-lg text-black"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {formatPrice(product.price, store.currency)}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-white/5">
                  <h3 className="font-bold text-white truncate">
                    {product.name}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p
            className="text-3xl font-black uppercase tracking-tighter mb-4"
            style={{ color: primaryColor }}
          >
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

      {/* WhatsApp Floating Button */}
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

      {/* Cart Bar */}
      {totalItems > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 animate-slideUp"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-4 text-black"
            >
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <span className="font-black">{totalItems}</span>
              </div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-wider opacity-70">Tu carrito</p>
                <p className="text-xl font-black">{formatPrice(totalPrice, store.currency)}</p>
              </div>
            </button>
            <button
              onClick={handleWhatsAppOrder}
              className="flex items-center gap-3 bg-black text-white px-6 py-3 font-bold uppercase text-sm tracking-wide hover:bg-white/90 hover:text-black transition-colors"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 animate-fadeIn"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-neutral-900 max-w-2xl w-full max-h-[90vh] overflow-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="aspect-square bg-black">
              {selectedProduct.imageUrl ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6">
              <h3 className="text-2xl font-black text-white uppercase mb-2">
                {selectedProduct.name}
              </h3>
              <p
                className="text-3xl font-black mb-4"
                style={{ color: primaryColor }}
              >
                {formatPrice(selectedProduct.price, store.currency)}
              </p>

              {selectedProduct.description && (
                <p className="text-white/60 mb-6 leading-relaxed">
                  {selectedProduct.description}
                </p>
              )}

              <button
                onClick={() => {
                  addItem(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="w-full py-4 font-bold uppercase text-sm tracking-wide text-black transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/90 animate-fadeIn"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="bg-neutral-900 w-full max-w-md h-full flex flex-col animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-black uppercase">Carrito ({totalItems})</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <svg className="w-10 h-10" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-white/40">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-4 bg-white/5 p-3">
                      <div className="w-20 h-20 bg-black flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white truncate">
                          {item.product.name}
                        </h4>
                        <p style={{ color: primaryColor }} className="font-bold">
                          {formatPrice(item.product.price, store.currency)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center font-bold"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto text-white/40 hover:text-red-500 transition-colors"
                          >
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

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 uppercase text-sm">Total</span>
                  <span
                    className="text-2xl font-black"
                    style={{ color: primaryColor }}
                  >
                    {formatPrice(totalPrice, store.currency)}
                  </span>
                </div>
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-4 font-bold uppercase text-sm tracking-wide text-black flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pedir por WhatsApp
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-white/40 text-sm uppercase hover:text-white/60 transition-colors"
                >
                  Vaciar carrito
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
            transform: scale(0.9);
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
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-slideLeft {
          animation: slideLeft 0.3s ease-out;
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
