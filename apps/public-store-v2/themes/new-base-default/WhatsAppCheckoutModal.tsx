'use client';

import { useCart, CartItem } from '../../lib/cart-context';
import { formatPrice } from '../../lib/currency';
import { toCloudinarySquare } from '../../lib/images';
import { StoreBasicInfo } from '../../lib/store';

interface WhatsAppCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeInfo?: StoreBasicInfo | null;
}

// Generar mensaje de WhatsApp
function generateWhatsAppMessage(
  items: CartItem[],
  total: number,
  currency: string,
  storeName: string,
  storeUrl: string
): string {
  let message = `Hola! Quiero hacer un pedido:\n\n`;

  items.forEach((item) => {
    const itemPrice = item.variant?.price || item.price;
    const itemTotal = itemPrice * item.quantity;

    message += `${item.name}`;
    if (item.variant) {
      message += ` (${item.variant.name})`;
    }
    message += ` - ${formatPrice(itemPrice, currency)}`;
    if (item.quantity > 1) {
      message += ` x${item.quantity} = ${formatPrice(itemTotal, currency)}`;
    }
    message += `\n`;
  });

  message += `\n*Total: ${formatPrice(total, currency)}*\n`;
  message += `\nVisto en: ${storeUrl}`;

  return message;
}

export default function WhatsAppCheckoutModal({
  isOpen,
  onClose,
  storeInfo,
}: WhatsAppCheckoutModalProps) {
  const { state, updateQuantity, removeItem, clearCart } = useCart();

  if (!isOpen) return null;

  const items = state.items;
  const currency = storeInfo?.currency || 'USD';

  // Calcular total
  const total = items.reduce((sum, item) => {
    const price = item.variant?.price || item.price;
    return sum + price * item.quantity;
  }, 0);

  // Obtener número de WhatsApp de la tienda
  const storePhone = storeInfo?.phone?.replace(/\D/g, '') || '';

  // URL de la tienda
  const storeUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  // Enviar pedido por WhatsApp
  const handleSendWhatsApp = () => {
    if (!storePhone) {
      alert('Esta tienda no tiene número de WhatsApp configurado');
      return;
    }

    const message = generateWhatsAppMessage(
      items,
      total,
      currency,
      storeInfo?.storeName || 'la tienda',
      storeUrl
    );

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${storePhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    // Limpiar carrito después de enviar
    clearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-3xl shadow-xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Tu pedido</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const itemPrice = item.variant?.price || item.price;

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 bg-gray-50 rounded-xl p-3"
                  >
                    {/* Imagen */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={toCloudinarySquare(item.image, 80)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.variant && (
                        <p className="text-sm text-gray-500">
                          {item.variant.name}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatPrice(itemPrice, currency)}
                      </p>
                    </div>

                    {/* Cantidad */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateQuantity(item.id, item.quantity - 1)
                            : removeItem(item.id)
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                      >
                        {item.quantity === 1 ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        ) : (
                          <span className="text-lg">-</span>
                        )}
                      </button>
                      <span className="w-6 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                      >
                        <span className="text-lg">+</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer con total y botón */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(total, currency)}
              </span>
            </div>

            {/* Botón WhatsApp */}
            <button
              onClick={handleSendWhatsApp}
              className="w-full py-4 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-3"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Enviar pedido por WhatsApp
            </button>

            {/* Nota */}
            <p className="text-xs text-center text-gray-400">
              Al tocar se abrirá WhatsApp con tu pedido listo para enviar
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
