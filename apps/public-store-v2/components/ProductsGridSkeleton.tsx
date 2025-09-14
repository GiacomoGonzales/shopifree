"use client";

interface ProductsGridSkeletonProps {
  itemCount?: number;
  className?: string;
}

export default function ProductsGridSkeleton({ itemCount = 8, className = "" }: ProductsGridSkeletonProps) {
  return (
    <div className={`nbd-products-grid nbd-mobile-grid ${className}`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="nbd-product-card animate-pulse">
          {/* Product image skeleton */}
          <div className="nbd-product-image bg-gray-200 rounded-lg mb-4" style={{ aspectRatio: '1' }}>
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Product content skeleton */}
          <div className="nbd-product-content">
            {/* Product name skeleton */}
            <div className="nbd-product-name mb-3">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>

            {/* Product footer skeleton */}
            <div className="nbd-product-footer flex justify-between items-center">
              {/* Price skeleton */}
              <div className="nbd-product-price">
                <div className="h-5 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>

              {/* Add to cart button skeleton */}
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}