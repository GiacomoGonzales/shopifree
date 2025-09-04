interface AddToCartButtonProps {
  productId: string
  productName: string
  isLoading: boolean
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function AddToCartButton({ 
  productId, 
  productName, 
  isLoading, 
  onClick 
}: AddToCartButtonProps) {
  return (
    <button 
      className={`nbd-add-to-cart ${isLoading ? 'nbd-add-to-cart--loading' : ''}`}
      onClick={onClick}
      aria-label={`Agregar ${productName} al carrito`}
      disabled={isLoading}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  )
}