'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { ProductWithId, formatPrice } from '../../lib/products'

interface ProductSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (productIds: string[]) => void
  products: ProductWithId[]
  selectedProductIds: string[]
  title?: string
  storeCurrency?: string
}

export default function ProductSelector({
  isOpen,
  onClose,
  onSelect,
  products,
  selectedProductIds,
  title,
  storeCurrency = 'USD'
}: ProductSelectorProps) {
  const t = useTranslations('collections.productSelector')
  const [searchQuery, setSearchQuery] = useState('')
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedProductIds)

  // Reset local selection when modal opens/closes or props change
  useEffect(() => {
    setLocalSelectedIds(selectedProductIds)
  }, [selectedProductIds, isOpen])

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products
    }

    const query = searchQuery.toLowerCase().trim()
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  const handleProductToggle = (productId: string) => {
    setLocalSelectedIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    const visibleProductIds = filteredProducts.map(p => p.id)
    const allSelected = visibleProductIds.every(id => localSelectedIds.includes(id))
    
    if (allSelected) {
      // Deselect all visible products
      setLocalSelectedIds(prev => prev.filter(id => !visibleProductIds.includes(id)))
    } else {
      // Select all visible products
      setLocalSelectedIds(prev => {
        const newIds = [...prev]
        visibleProductIds.forEach(id => {
          if (!newIds.includes(id)) {
            newIds.push(id)
          }
        })
        return newIds
      })
    }
  }

  const handleApply = () => {
    onSelect(localSelectedIds)
    onClose()
  }

  const handleCancel = () => {
    setLocalSelectedIds(selectedProductIds)
    onClose()
  }

  if (!isOpen) return null

  const visibleProductIds = filteredProducts.map(p => p.id)
  const allVisibleSelected = visibleProductIds.length > 0 && visibleProductIds.every(id => localSelectedIds.includes(id))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {title || t('title')}
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search and controls */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {localSelectedIds.length} {t('selected')}
              </span>
              {filteredProducts.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  {allVisibleSelected ? t('deselectAll') : t('selectAll')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchQuery ? 'No se encontraron productos' : t('noProducts')}
              </h3>
              {searchQuery && (
                <p className="mt-1 text-sm text-gray-500">
                  Intenta con otros términos de búsqueda
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProducts.map((product) => {
                const isSelected = localSelectedIds.includes(product.id)
                return (
                  <div
                    key={product.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-gray-600 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleProductToggle(product.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleProductToggle(product.id)}
                          className="h-4 w-4 text-gray-600 focus:ring-gray-600 border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="flex-shrink-0">
                        {product.mediaFiles && product.mediaFiles.length > 0 ? (
                          <img
                            src={product.mediaFiles[0].url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        {product.description && (
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(product.price, storeCurrency)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : product.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {localSelectedIds.length} de {products.length} productos {t('selected')}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors duration-200"
            >
              {t('apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 