'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { CollectionWithId, Collection } from '../../lib/collections'
import { ProductWithId, getProducts } from '../../lib/products'
import { uploadImageToCloudinary } from '../../lib/cloudinary'

interface CollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (collectionData: Omit<Collection, 'createdAt' | 'updatedAt' | 'slug' | 'order'>) => Promise<void>
  collection?: CollectionWithId | null
  storeId: string
}

export default function CollectionModal({ isOpen, onClose, onSave, collection, storeId }: CollectionModalProps) {
  const t = useTranslations('pages.collections')
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [visible, setVisible] = useState(true)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [products, setProducts] = useState<ProductWithId[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Cargar productos cuando se abre el modal
  useEffect(() => {
    if (isOpen && storeId) {
      loadProducts()
    }
  }, [isOpen, storeId])

  // Cargar datos de la colección cuando se edita
  useEffect(() => {
    if (collection) {
      setTitle(collection.title)
      setDescription(collection.description || '')
      setImage(collection.image || '')
      setVisible(collection.visible)
      setSelectedProductIds(collection.productIds || [])
    } else {
      // Reset form for new collection
      setTitle('')
      setDescription('')
      setImage('')
      setVisible(true)
      setSelectedProductIds([])
    }
    setImageFile(null)
  }, [collection])

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      const productsData = await getProducts(storeId)
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const result = await uploadImageToCloudinary(file, { folder: 'products' })
      setImage(result.secure_url)
      setImageFile(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(t('messages.imageUploadError'))
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImage('')
    setImageFile(null)
  }

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    const filteredProducts = getFilteredProducts()
    const allIds = filteredProducts.map(p => p.id)
    setSelectedProductIds(allIds)
  }

  const handleDeselectAll = () => {
    setSelectedProductIds([])
  }

  const getFilteredProducts = () => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert(t('messages.titleRequired'))
      return
    }

    if (selectedProductIds.length === 0) {
      alert(t('messages.productsRequired'))
      return
    }

    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        image,
        productIds: selectedProductIds,
        visible
      })
      onClose()
    } catch (error) {
      console.error('Error saving collection:', error)
      alert(t('messages.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!saving) {
      onClose()
    }
  }

  if (!isOpen) return null

  const filteredProducts = getFilteredProducts()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {collection ? t('editCollection') : t('addCollection')}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.title')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('form.titlePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.image')}
            </label>
            <p className="text-sm text-gray-500 mb-2">{t('form.imageHint')}</p>
            
            {image ? (
              <div className="space-y-2">
                <img
                  src={image}
                  alt="Collection"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <div className="flex gap-2">
                  <label className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    {t('imageUpload.change')}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage || saving}
                    />
                  </label>
                  <button
                    onClick={handleRemoveImage}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    disabled={uploadingImage || saving}
                  >
                    {t('imageUpload.remove')}
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 block">
                {uploadingImage ? (
                  <div className="text-blue-500">
                    {t('imageUpload.uploading')}
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">{t('imageUpload.dropZone')}</p>
                    <p className="text-xs text-gray-500">{t('imageUpload.formats')}</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage || saving}
                />
              </label>
            )}
          </div>

          {/* Visibility */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="visible"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={saving}
            />
            <label htmlFor="visible" className="ml-2 block text-sm text-gray-700">
              {t('form.visible')}
            </label>
          </div>
          <p className="text-sm text-gray-500">{t('form.visibleHint')}</p>

          {/* Products Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.products')} <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">{t('form.productsHint')}</p>
            
            {loadingProducts ? (
              <div className="text-center py-4">
                <div className="text-gray-500">{t('form.searchProducts')}</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('form.searchProducts')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />

                {/* Selection Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={saving}
                  >
                    {t('actions.selectAll')}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={saving}
                  >
                    {t('actions.deselectAll')}
                  </button>
                  <span className="text-sm text-gray-500 ml-auto">
                    {selectedProductIds.length} {t('form.selectedProducts')}
                  </span>
                </div>

                {/* Products List */}
                <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {products.length === 0 ? t('form.noProductsAvailable') : t('form.noProductsFound')}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="p-3 hover:bg-gray-50">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(product.id)}
                              onChange={() => handleProductToggle(product.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              disabled={saving}
                            />
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="flex items-center">
                                {product.mediaFiles && product.mediaFiles.length > 0 && (
                                  <img
                                    src={product.mediaFiles[0].url}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded mr-3"
                                  />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ${product.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={saving}
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={saving || uploadingImage}
          >
            {saving ? t('actions.saving') : (collection ? t('actions.update') : t('actions.create'))}
          </button>
        </div>
      </div>
    </div>
  )
} 