'use client';

import { useCart } from '../lib/cart-context';

export default function CartTest() {
  const { state, addItem, openCart, removeItem, clearCart } = useCart();

  const addTestProduct = () => {
    const testProduct = {
      id: 'test-product-1',
      productId: 'test-product-1',
      name: 'Producto de Prueba',
      price: 1000,
      currency: 'COP',
      image: 'https://via.placeholder.com/150',
      slug: 'test-product',
      incomplete: false
    };

    addItem(testProduct, 1);
    console.log('✅ Producto de prueba agregado al carrito');
  };

  const addTestProductWithVariant = () => {
    const testProduct = {
      id: 'test-product-2-variant-red',
      productId: 'test-product-2',
      name: 'Producto con Variante',
      price: 1500,
      currency: 'COP',
      image: 'https://via.placeholder.com/150',
      slug: 'test-product-variant',
      variant: {
        id: 'red',
        name: 'Color: Rojo',
        price: 1500
      },
      incomplete: false
    };

    addItem(testProduct, 1);
    console.log('✅ Producto con variante agregado al carrito');
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #007bff', borderRadius: '8px', margin: '20px' }}>
      <h3>🧪 Test del Carrito</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Estado del Carrito:</h4>
        <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Acciones:</h4>
        <button 
          onClick={addTestProduct}
          style={{ 
            padding: '10px 20px', 
            margin: '5px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ➕ Agregar Producto Simple
        </button>
        
        <button 
          onClick={addTestProductWithVariant}
          style={{ 
            padding: '10px 20px', 
            margin: '5px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ➕ Agregar con Variante
        </button>
        
        <button 
          onClick={openCart}
          style={{ 
            padding: '10px 20px', 
            margin: '5px', 
            backgroundColor: '#ffc107', 
            color: 'black', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🛒 Abrir Carrito
        </button>
        
        <button 
          onClick={clearCart}
          style={{ 
            padding: '10px 20px', 
            margin: '5px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Limpiar Carrito
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Items en el Carrito:</h4>
        {state.items.length === 0 ? (
          <p>No hay items en el carrito</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {state.items.map((item) => (
              <li 
                key={item.id} 
                style={{ 
                  border: '1px solid #ddd', 
                  padding: '10px', 
                  margin: '5px 0', 
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  {item.variant && <span> - {item.variant.name}</span>}
                  <br />
                  <small>Cantidad: {item.quantity} | Precio: ${item.price}</small>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  style={{ 
                    padding: '5px 10px', 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4>Resumen:</h4>
        <p><strong>Total de items:</strong> {state.totalItems}</p>
        <p><strong>Precio total:</strong> ${state.totalPrice}</p>
        <p><strong>Carrito abierto:</strong> {state.isOpen ? 'Sí' : 'No'}</p>
      </div>
    </div>
  );
}

