'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import { useStore } from '../../../../lib/hooks/useStore'
import { createProduct, generateSlug } from '../../../../lib/products'
import { uploadMediaToCloudinary } from '../../../../lib/cloudinary'

export default function CreateProductSimplePage() {
  const router = useRouter()
  const { store, loading: storeLoading, currencySymbol } = useStore()

  // Solo 4 estados - foto, nombre, precio, descripcion
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!store?.id) return
    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (!price || parseFloat(price) <= 0) {
      setError('El precio debe ser mayor a 0')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Subir imagen si existe
      let mediaFiles: { id: string; url: string; cloudinaryPublicId?: string; type: 'image' }[] = []

      if (imageFile) {
        const uploadResult = await uploadMediaToCloudinary(imageFile, {
          folder: 'products',
          storeId: store.id
        })
        if (uploadResult) {
          mediaFiles = [{
            id: crypto.randomUUID(),
            url: uploadResult.secure_url,
            cloudinaryPublicId: uploadResult.public_id,
            type: 'image'
          }]
        }
      }

      // Crear producto con datos mínimos
      const slug = generateSlug(name)

      await createProduct(store.id, {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        mediaFiles,
        urlSlug: slug,
        status: 'active',
        // Valores por defecto para campos requeridos
        comparePrice: null,
        cost: null,
        chargeTaxes: false,
        selectedBrandId: null,
        selectedCategory: null,
        selectedParentCategoryIds: [],
        selectedSubcategoryIds: [],
        metaFieldValues: {},
        hasVariants: false,
        variants: [],
        trackStock: false,
        stockQuantity: null,
        requiresShipping: false,
        weight: null,
        countryOrigin: null,
        harmonizedCode: null,
        seoTitle: null,
        metaDescription: null,
      })

      // Redirigir al home
      router.push('/home')
    } catch (err) {
      console.error('Error creando producto:', err)
      setError('Error al crear el producto. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (storeLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-light text-gray-900">Agregar producto</h1>
            <p className="text-gray-500 mt-1">Completa los datos basicos de tu producto</p>
          </div>

          {/* Formulario en grid */}
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
            {/* Columna izquierda - Imagen */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Foto del producto
              </label>
              <div
                className="relative aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50"
                onClick={() => document.getElementById('image-input')?.click()}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                      className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 mb-1">Arrastra una foto aqui</p>
                    <p className="text-gray-400 text-sm">o haz clic para seleccionar</p>
                  </div>
                )}
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Columna derecha - Datos */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                {/* Nombre */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del producto *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Torta de chocolate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Precio */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {currencySymbol || '$'}
                    </span>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Descripcion (opcional) */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripcion <span className="text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe tu producto..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim() || !price}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    'Guardar producto'
                  )}
                </button>
              </div>

              {/* Link a version avanzada */}
              <p className="text-sm text-gray-500 text-center">
                Necesitas variantes, categorias o stock?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/products/create')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Usar version avanzada
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
