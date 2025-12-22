'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import DashboardLayout from '../../../../components/DashboardLayout'
import { useStore } from '../../../../lib/hooks/useStore'
import { createProduct, generateSlug } from '../../../../lib/products'

interface ProductRow {
  nombre: string
  precio: number
  descripcion?: string
  valid: boolean
  error?: string
}

export default function ImportProductsPage() {
  const router = useRouter()
  const { store, loading: storeLoading, currencySymbol } = useStore()

  const [file, setFile] = useState<File | null>(null)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)
    setProducts([])

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]

        if (jsonData.length < 2) {
          setError('El archivo debe tener al menos una fila de encabezados y una fila de datos')
          return
        }

        // Obtener encabezados (primera fila)
        const headers = (jsonData[0] as string[]).map(h =>
          String(h || '').toLowerCase().trim()
        )

        // Buscar indices de columnas
        const nombreIdx = headers.findIndex(h =>
          h === 'nombre' || h === 'name' || h === 'producto' || h === 'product'
        )
        const precioIdx = headers.findIndex(h =>
          h === 'precio' || h === 'price' || h === 'valor' || h === 'value'
        )
        const descripcionIdx = headers.findIndex(h =>
          h === 'descripcion' || h === 'description' || h === 'desc'
        )

        if (nombreIdx === -1) {
          setError('No se encontro la columna "Nombre" o "Name" en el archivo')
          return
        }
        if (precioIdx === -1) {
          setError('No se encontro la columna "Precio" o "Price" en el archivo')
          return
        }

        // Parsear filas de datos (saltando encabezado)
        const parsedProducts: ProductRow[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as (string | number)[]
          if (!row || row.length === 0) continue

          const nombre = String(row[nombreIdx] || '').trim()
          const precioRaw = row[precioIdx]
          const descripcion = descripcionIdx !== -1 ? String(row[descripcionIdx] || '').trim() : ''

          // Validar nombre
          if (!nombre) {
            continue // Saltar filas vacias
          }

          // Parsear precio
          let precio = 0
          if (typeof precioRaw === 'number') {
            precio = precioRaw
          } else if (typeof precioRaw === 'string') {
            // Limpiar el string de precio (quitar simbolos de moneda, comas, etc)
            const cleanPrice = precioRaw.replace(/[^0-9.,]/g, '').replace(',', '.')
            precio = parseFloat(cleanPrice) || 0
          }

          const valid = nombre.length > 0 && precio > 0
          const error = !valid
            ? (nombre.length === 0 ? 'Nombre requerido' : 'Precio invalido')
            : undefined

          parsedProducts.push({
            nombre,
            precio,
            descripcion,
            valid,
            error
          })
        }

        if (parsedProducts.length === 0) {
          setError('No se encontraron productos validos en el archivo')
          return
        }

        setProducts(parsedProducts)
        setStep('preview')
      } catch (err) {
        console.error('Error parsing file:', err)
        setError('Error al leer el archivo. Asegurate de que sea un archivo Excel valido (.xlsx, .xls)')
      }
    }
    reader.readAsBinaryString(selectedFile)
  }, [])

  const handleImport = async () => {
    if (!store?.id) return

    const validProducts = products.filter(p => p.valid)
    if (validProducts.length === 0) {
      setError('No hay productos validos para importar')
      return
    }

    setImporting(true)
    setProgress(0)
    setError(null)

    let imported = 0
    let failed = 0

    for (let i = 0; i < validProducts.length; i++) {
      const product = validProducts[i]

      try {
        const slug = generateSlug(product.nombre)

        await createProduct(store.id, {
          name: product.nombre,
          description: product.descripcion || '',
          price: product.precio,
          mediaFiles: [],
          urlSlug: slug,
          status: 'active',
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

        imported++
      } catch (err) {
        console.error(`Error importing product ${product.nombre}:`, err)
        failed++
      }

      setProgress(Math.round(((i + 1) / validProducts.length) * 100))
    }

    setImporting(false)
    setStep('done')
    setSuccess(`Se importaron ${imported} productos correctamente${failed > 0 ? ` (${failed} fallaron)` : ''}`)
  }

  const downloadTemplate = () => {
    const template = [
      ['Nombre', 'Precio', 'Descripcion'],
      ['Torta de chocolate', 45, 'Deliciosa torta casera'],
      ['Cupcake de vainilla', 8, 'Cupcake con frosting'],
      ['Galletas de avena', 15, 'Paquete de 6 unidades'],
    ]

    const ws = XLSX.utils.aoa_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Productos')
    XLSX.writeFile(wb, 'plantilla_productos.xlsx')
  }

  const validCount = products.filter(p => p.valid).length
  const invalidCount = products.filter(p => !p.valid).length

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-light text-gray-900">Importar productos</h1>
              <p className="text-gray-500 mt-1">Sube un archivo Excel con tus productos</p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>

          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Descargar plantilla */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Formato requerido</p>
                    <p className="text-blue-700 text-sm mt-1">
                      Tu archivo debe tener columnas: <strong>Nombre</strong>, <strong>Precio</strong>, y opcionalmente <strong>Descripcion</strong>
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar plantilla de ejemplo
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-400 transition-colors cursor-pointer bg-white"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 mb-2">Arrastra tu archivo Excel aqui o haz clic para seleccionar</p>
                <p className="text-gray-400 text-sm">Formatos aceptados: .xlsx, .xls</p>
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Archivo: {file?.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm">
                        <span className="font-medium text-emerald-600">{validCount}</span> validos
                      </span>
                      {invalidCount > 0 && (
                        <span className="text-sm">
                          <span className="font-medium text-red-600">{invalidCount}</span> con errores
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setStep('upload')
                      setFile(null)
                      setProducts([])
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cambiar archivo
                  </button>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((product, idx) => (
                        <tr key={idx} className={product.valid ? '' : 'bg-red-50'}>
                          <td className="px-4 py-3 text-sm text-gray-900">{product.nombre || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {product.precio > 0 ? `${currencySymbol}${product.precio.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {product.valid ? (
                              <span className="text-emerald-600">OK</span>
                            ) : (
                              <span className="text-red-600">{product.error}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Boton importar */}
              <button
                onClick={handleImport}
                disabled={importing || validCount === 0}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Importando... {progress}%
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Importar {validCount} productos
                  </>
                )}
              </button>

              {importing && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Importacion completada</h2>
              <p className="text-gray-600 mb-8">{success}</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/catalog')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                >
                  Ir a mi catalogo
                </button>
                <button
                  onClick={() => {
                    setStep('upload')
                    setFile(null)
                    setProducts([])
                    setSuccess(null)
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Importar mas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
