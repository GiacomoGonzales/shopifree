'use client';

import { Product } from '@/lib/store';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/lib/cart';

interface Props {
  product: Product;
  currency: string;
  onClick?: () => void;
}

export default function ProductCard({ product, currency, onClick }: Props) {
  const { addItem } = useCart();

  return (
    <article className="group cursor-pointer" onClick={onClick}>
      {/* Image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(product.price, currency)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="ml-2 text-sm text-gray-400 line-through">
              {formatPrice(product.comparePrice, currency)}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(product);
          }}
          className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
          aria-label="Agregar al carrito"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </article>
  );
}
