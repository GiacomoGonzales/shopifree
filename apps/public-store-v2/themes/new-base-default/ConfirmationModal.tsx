'use client'

import React, { useState, useEffect } from 'react'
import { StoreBasicInfo } from '../../lib/store'
import { formatPrice } from '../../lib/currency'
import jsPDF from 'jspdf'

interface OrderData {
  customer: {
    fullName: string
    email: string
    phone: string
  }
  shipping: {
    method: string
    addressText?: string
    cost: number
  }
  payment: {
    method: string
    notes?: string
  }
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    variant?: {
      name: string
      price: number
    }
  }>
  totals: {
    subtotal: number
    shipping: number
    total: number
  }
  metadata?: {
    orderId?: string
    currency?: string
  }
}

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  orderData: OrderData | null
  storeInfo: StoreBasicInfo
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  orderData, 
  storeInfo 
}: ConfirmationModalProps) {
  const [currentStep, setCurrentStep] = useState<'loading' | 'success'>('loading')

  useEffect(() => {
    if (isOpen) {
      console.log('🎯 ConfirmationModal abierto!', { orderData })
      setCurrentStep('loading')
      // Simular proceso de envío del pedido
      const timer = setTimeout(() => {
        console.log('🎯 Cambiando a success state')
        setCurrentStep('success')
      }, 2500) // 2.5 segundos de animación de carga

      return () => clearTimeout(timer)
    }
  }, [isOpen, orderData])

  if (!isOpen || !orderData) return null

  const currency = orderData.metadata?.currency || storeInfo.currency || 'COP'
  const orderId = orderData.metadata?.orderId

  // Función para volver a la tienda
  const goToHome = () => {
    if (typeof window === 'undefined') return
    
    const pathname = window.location.pathname
    const host = window.location.hostname
    const isCustomDomain = !host.endsWith('shopifree.app') && !host.endsWith('localhost') && host !== 'localhost'
    
    let homeUrl
    if (isCustomDomain) {
      homeUrl = '/'
    } else {
      const pathParts = pathname.split('/')
      const storeSubdomain = pathParts[1]
      homeUrl = `/${storeSubdomain}`
    }
    
    onClose()
    window.location.href = homeUrl
  }

  // Función para contactar por WhatsApp
  const contactWhatsApp = () => {
    if (!storeInfo?.phone) {
      alert('El número de WhatsApp no está configurado para esta tienda')
      return
    }

    const orderSummary = orderData.items
      .map(item => `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity, currency)}`)
      .join('\n')

    const message = `¡Hola! 👋

Acabo de realizar un pedido en ${storeInfo.storeName}${orderId ? ` (#${orderId})` : ''}:

🛍️ *Resumen del pedido:*
${orderSummary}

💰 *Total: ${formatPrice(orderData.totals.total, currency)}*

📦 *Método de envío:* ${orderData.shipping.method}
${orderData.shipping.addressText ? `📍 *Dirección:* ${orderData.shipping.addressText}` : ''}
💳 *Método de pago:* ${orderData.payment.method}

¿Podrían confirmarme el estado de mi pedido?

¡Gracias!`

    const whatsappNumber = storeInfo.phone.replace(/[^\d]/g, '')
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
  }

  // Función para generar y descargar PDF del comprobante
  const downloadReceipt = async () => {
    if (!orderData) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 12
    let yPosition = 20

    // Colores de la marca (con fallbacks)
    const primaryColor = storeInfo.primaryColor || '#2563eb'
    const secondaryColor = storeInfo.secondaryColor || '#64748b'
    
    // Convertir hex a RGB para jsPDF
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 37, g: 99, b: 235 } // fallback azul
    }

    const primaryRgb = hexToRgb(primaryColor)
    const secondaryRgb = hexToRgb(secondaryColor)

    // Header más compacto
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.rect(0, 0, pageWidth, 45, 'F')

    // Logo de la tienda más pequeño
    if (storeInfo.logoUrl) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise((resolve) => {
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              const logoSize = 120
              canvas.width = logoSize
              canvas.height = logoSize
              
              if (ctx) {
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                
                const aspectRatio = img.width / img.height
                let drawWidth = logoSize
                let drawHeight = logoSize
                
                if (aspectRatio > 1) {
                  drawHeight = logoSize / aspectRatio
                } else {
                  drawWidth = logoSize * aspectRatio
                }
                
                const x = (logoSize - drawWidth) / 2
                const y = (logoSize - drawHeight) / 2
                
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(img, x, y, drawWidth, drawHeight)
                
                const dataUrl = canvas.toDataURL('image/png', 1.0)
                doc.addImage(dataUrl, 'PNG', margin, 8, 28, 22)
              }
              resolve(true)
            } catch (e) {
              resolve(false)
            }
          }
          img.onerror = () => resolve(false)
          img.src = storeInfo.logoUrl
        })
      } catch (e) {
        console.log('No se pudo cargar el logo, continuando sin él')
      }
    }

    // Nombre de la tienda en el header
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    const storeNameX = storeInfo.logoUrl ? margin + 35 : margin
    doc.text(storeInfo.storeName || 'Tienda', storeNameX, 22)

    // Título del documento
    doc.setFontSize(11)
    doc.text('COMPROBANTE DE PEDIDO', pageWidth - margin, 18, { align: 'right' })
    doc.setFontSize(10)
    doc.text(`#${orderId || 'N/A'}`, pageWidth - margin, 28, { align: 'right' })

    yPosition = 55

    // Mensaje de agradecimiento más compacto
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('¡Gracias por tu compra!', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 6

    doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Tu pedido ha sido recibido y está siendo procesado', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 12

    // Información del pedido en dos columnas más compactas
    doc.setTextColor(0, 0, 0)
    
    const columnWidth = (pageWidth - 3 * margin) / 2
    const boxHeight = 32
    
    // Columna izquierda - Información del cliente
    doc.setFillColor(248, 250, 252)
    doc.rect(margin, yPosition, columnWidth, boxHeight, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.text('INFORMACIÓN DEL CLIENTE', margin + 2, yPosition + 7)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(0, 0, 0)
    let clientInfoY = yPosition + 13
    doc.text(`${orderData.customer.fullName}`, margin + 2, clientInfoY)
    if (orderData.customer.email) {
      clientInfoY += 5
      doc.text(`${orderData.customer.email}`, margin + 2, clientInfoY)
    }
    if (orderData.customer.phone) {
      clientInfoY += 5
      doc.text(`${orderData.customer.phone}`, margin + 2, clientInfoY)
    }

    // Columna derecha - Información de entrega
    const rightColumnX = margin + columnWidth + margin
    doc.setFillColor(248, 250, 252)
    doc.rect(rightColumnX, yPosition, columnWidth, boxHeight, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.text('INFORMACIÓN DE ENTREGA', rightColumnX + 2, yPosition + 7)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(0, 0, 0)
    let deliveryInfoY = yPosition + 13
    doc.text(`Método: ${orderData.shipping.method}`, rightColumnX + 2, deliveryInfoY)
    if (orderData.shipping.addressText) {
      deliveryInfoY += 5
      const addressLines = doc.splitTextToSize(orderData.shipping.addressText, columnWidth - 4)
      doc.text(addressLines.slice(0, 3), rightColumnX + 2, deliveryInfoY) // Máximo 3 líneas
    }

    yPosition += boxHeight + 8

    // Fecha más compacta
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, margin, yPosition)
    yPosition += 10

    // Tabla de productos más compacta
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.text('PRODUCTOS PEDIDOS', margin, yPosition)
    yPosition += 6

    // Header de la tabla más pequeño
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('PRODUCTO', margin + 2, yPosition + 5.5)
    doc.text('CANT.', pageWidth - 60, yPosition + 5.5)
    doc.text('PRECIO', pageWidth - margin - 2, yPosition + 5.5, { align: 'right' })
    yPosition += 8

    // Productos más compactos
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)

    orderData.items.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? [255, 255, 255] : [248, 250, 252]
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2])
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F')
      
      const itemText = `${item.name}${item.variant ? ` (${item.variant.name})` : ''}`
      const itemLines = doc.splitTextToSize(itemText, 80)
      
      doc.text(itemLines[0], margin + 2, yPosition + 5.5) // Solo primera línea
      doc.text(`${item.quantity}`, pageWidth - 60, yPosition + 5.5)
      doc.text(formatPrice(item.price * item.quantity, currency), pageWidth - margin - 2, yPosition + 5.5, { align: 'right' })
      yPosition += 8
    })

    yPosition += 5

    // Totales más compactos
    const totalsWidth = 65
    const totalsX = pageWidth - totalsWidth - margin
    doc.setFillColor(248, 250, 252)
    doc.rect(totalsX, yPosition, totalsWidth, 24, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0)
    doc.text('Subtotal:', totalsX + 2, yPosition + 6)
    doc.text(formatPrice(orderData.totals.subtotal, currency), pageWidth - margin - 2, yPosition + 6, { align: 'right' })

    doc.text('Envío:', totalsX + 2, yPosition + 12)
    doc.text(formatPrice(orderData.totals.shipping, currency), pageWidth - margin - 2, yPosition + 12, { align: 'right' })

    // Total destacado
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.rect(totalsX, yPosition + 16, totalsWidth, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('TOTAL:', totalsX + 2, yPosition + 21)
    doc.text(formatPrice(orderData.totals.total, currency), pageWidth - margin - 2, yPosition + 21, { align: 'right' })

    yPosition += 30

    // Método de pago compacto
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(`Método de pago: `, margin, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(orderData.payment.method, margin + 25, yPosition)

    if (orderData.payment.notes) {
      yPosition += 6
      doc.setFont('helvetica', 'bold')
      doc.text('Notas: ', margin, yPosition)
      doc.setFont('helvetica', 'normal')
      const notesLines = doc.splitTextToSize(orderData.payment.notes, pageWidth - 2 * margin - 12)
      doc.text(notesLines.slice(0, 2), margin + 12, yPosition) // Máximo 2 líneas
      yPosition += notesLines.length * 3
    }

    // Footer más compacto en la parte inferior
    const footerY = pageHeight - 25
    doc.setFillColor(248, 250, 252)
    doc.rect(0, footerY, pageWidth, 25, 'F')
    
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('¡Esperamos que disfrutes tu compra!', pageWidth / 2, footerY + 8, { align: 'center' })
    
    doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Gracias por confiar en nosotros', pageWidth / 2, footerY + 15, { align: 'center' })

    if (storeInfo.phone) {
      doc.text(`Contacto: ${storeInfo.phone}`, pageWidth / 2, footerY + 21, { align: 'center' })
    }

    // Descargar el PDF
    const fileName = `comprobante-${storeInfo.storeName?.replace(/[^a-zA-Z0-9]/g, '-') || 'tienda'}-${orderId || 'pedido'}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  return (
    <div 
      className="nbd-modal-overlay" 
      style={{ 
        zIndex: 10001,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="nbd-modal-content" style={{ maxWidth: '600px' }}>
        {currentStep === 'loading' && (
          <>
            <div className="nbd-modal-header">
              <h2 className="nbd-modal-title">Procesando tu pedido</h2>
            </div>
            <div className="nbd-modal-body" style={{ textAlign: 'center', padding: 'var(--nbd-space-4xl)' }}>
              <div className="nbd-loading-spinner">
                <svg 
                  width="64" 
                  height="64" 
                  viewBox="0 0 64 64" 
                  fill="none"
                  style={{ margin: '0 auto var(--nbd-space-xl)' }}
                >
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    stroke="var(--nbd-neutral-200)" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    stroke="var(--nbd-primary)" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray="175"
                    strokeDashoffset="175"
                    style={{
                      animation: 'nbd-loading-spin 1.5s ease-in-out infinite'
                    }}
                  />
                </svg>
              </div>
              <h3 style={{ 
                fontSize: 'var(--nbd-font-size-lg)', 
                fontWeight: '600', 
                color: 'var(--nbd-primary)',
                marginBottom: 'var(--nbd-space-sm)'
              }}>
                Enviando tu pedido...
              </h3>
              <p style={{ 
                color: 'var(--nbd-neutral-600)', 
                fontSize: 'var(--nbd-font-size-base)'
              }}>
                Por favor espera mientras procesamos tu orden
              </p>
            </div>
          </>
        )}

        {currentStep === 'success' && (
          <>
            <div className="nbd-modal-header">
              <h2 className="nbd-modal-title" style={{ color: 'var(--nbd-success)' }}>
                ¡Pedido realizado con éxito!
              </h2>
              <button
                onClick={onClose}
                className="nbd-modal-close"
                aria-label="Cerrar modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="nbd-modal-body">
              {/* Icono de éxito */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--nbd-space-xl)' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'var(--nbd-success)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--nbd-space-lg)',
                  animation: 'nbd-success-bounce 0.6s ease-out'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 style={{ 
                  fontSize: 'var(--nbd-font-size-xl)', 
                  fontWeight: '600', 
                  color: 'var(--nbd-primary)',
                  marginBottom: 'var(--nbd-space-sm)'
                }}>
                  ¡Gracias por tu compra!
                </h3>
                <p style={{ 
                  color: 'var(--nbd-neutral-600)', 
                  fontSize: 'var(--nbd-font-size-base)'
                }}>
                  Tu pedido ha sido recibido y está siendo procesado
                </p>
              </div>

              {/* Información del pedido */}
              <div style={{
                backgroundColor: 'var(--nbd-neutral-50)',
                borderRadius: 'var(--nbd-radius-lg)',
                padding: 'var(--nbd-space-xl)',
                marginBottom: 'var(--nbd-space-xl)'
              }}>
                {orderId && (
                  <div style={{ marginBottom: 'var(--nbd-space-lg)' }}>
                    <p style={{ 
                      fontSize: 'var(--nbd-font-size-sm)', 
                      color: 'var(--nbd-neutral-600)',
                      marginBottom: 'var(--nbd-space-xs)'
                    }}>
                      Número de pedido:
                    </p>
                    <p style={{ 
                      fontSize: 'var(--nbd-font-size-lg)', 
                      fontWeight: '600', 
                      color: 'var(--nbd-primary)'
                    }}>
                      #{orderId}
                    </p>
                  </div>
                )}

                <div style={{ marginBottom: 'var(--nbd-space-lg)' }}>
                  <h4 style={{ 
                    fontSize: 'var(--nbd-font-size-base)', 
                    fontWeight: '600', 
                    color: 'var(--nbd-primary)',
                    marginBottom: 'var(--nbd-space-sm)'
                  }}>
                    Productos:
                  </h4>
                  {orderData.items.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--nbd-space-sm) 0',
                      borderBottom: index < orderData.items.length - 1 ? '1px solid var(--nbd-neutral-200)' : 'none'
                    }}>
                      <div>
                        <p style={{ 
                          fontSize: 'var(--nbd-font-size-sm)', 
                          fontWeight: '500', 
                          color: 'var(--nbd-primary)'
                        }}>
                          {item.name}
                        </p>
                        {item.variant && (
                          <p style={{ 
                            fontSize: 'var(--nbd-font-size-xs)', 
                            color: 'var(--nbd-neutral-600)'
                          }}>
                            {item.variant.name}
                          </p>
                        )}
                        <p style={{ 
                          fontSize: 'var(--nbd-font-size-xs)', 
                          color: 'var(--nbd-neutral-600)'
                        }}>
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <p style={{ 
                        fontSize: 'var(--nbd-font-size-sm)', 
                        fontWeight: '600', 
                        color: 'var(--nbd-primary)'
                      }}>
                        {formatPrice(item.price * item.quantity, currency)}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '2px solid var(--nbd-neutral-200)', paddingTop: 'var(--nbd-space-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--nbd-space-sm)' }}>
                    <span style={{ color: 'var(--nbd-neutral-600)' }}>Subtotal:</span>
                    <span>{formatPrice(orderData.totals.subtotal, currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--nbd-space-sm)' }}>
                    <span style={{ color: 'var(--nbd-neutral-600)' }}>Envío:</span>
                    <span>{formatPrice(orderData.totals.shipping, currency)}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: 'var(--nbd-font-size-lg)',
                    fontWeight: '700',
                    color: 'var(--nbd-primary)'
                  }}>
                    <span>Total:</span>
                    <span>{formatPrice(orderData.totals.total, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Información del cliente y envío */}
              <div style={{ marginBottom: 'var(--nbd-space-xl)' }}>
                <div style={{
                  backgroundColor: 'var(--nbd-neutral-50)',
                  borderRadius: 'var(--nbd-radius-md)',
                  padding: 'var(--nbd-space-lg)',
                  marginBottom: 'var(--nbd-space-lg)'
                }}>
                  <h4 style={{ 
                    fontSize: 'var(--nbd-font-size-base)', 
                    fontWeight: '600', 
                    color: 'var(--nbd-primary)',
                    marginBottom: 'var(--nbd-space-sm)'
                  }}>
                    Información del cliente:
                  </h4>
                  <p style={{ 
                    fontSize: 'var(--nbd-font-size-sm)', 
                    color: 'var(--nbd-neutral-600)',
                    lineHeight: '1.6',
                    margin: '0'
                  }}>
                    <strong>Nombre:</strong> {orderData.customer.fullName}<br />
                    {orderData.customer.email && (
                      <>
                        <strong>Email:</strong> {orderData.customer.email}<br />
                      </>
                    )}
                    {orderData.customer.phone && (
                      <>
                        <strong>Teléfono:</strong> {orderData.customer.phone}
                      </>
                    )}
                  </p>
                </div>

                <div style={{
                  backgroundColor: 'var(--nbd-neutral-50)',
                  borderRadius: 'var(--nbd-radius-md)',
                  padding: 'var(--nbd-space-lg)'
                }}>
                  <h4 style={{ 
                    fontSize: 'var(--nbd-font-size-base)', 
                    fontWeight: '600', 
                    color: 'var(--nbd-primary)',
                    marginBottom: 'var(--nbd-space-sm)'
                  }}>
                    Información de entrega:
                  </h4>
                  <p style={{ 
                    fontSize: 'var(--nbd-font-size-sm)', 
                    color: 'var(--nbd-neutral-600)',
                    lineHeight: '1.6',
                    margin: '0'
                  }}>
                    <strong>Método de envío:</strong> {orderData.shipping.method}<br />
                    {orderData.shipping.addressText && (
                      <>
                        <strong>Dirección:</strong> {orderData.shipping.addressText}<br />
                      </>
                    )}
                    <strong>Método de pago:</strong> {orderData.payment.method}
                    {orderData.payment.notes && (
                      <>
                        <br />
                        <strong>Notas:</strong> {orderData.payment.notes}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="nbd-modal-footer" style={{ 
              flexDirection: 'column', 
              gap: 'var(--nbd-space-sm)',
              padding: 'var(--nbd-space-lg)'
            }}>
              {/* Botón de descarga PDF */}
              <button
                onClick={downloadReceipt}
                className="nbd-btn"
                style={{
                  backgroundColor: 'var(--nbd-primary)',
                  color: 'white',
                  border: 'none',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--nbd-space-xs)',
                  padding: 'var(--nbd-space-md)',
                  fontSize: 'var(--nbd-font-size-sm)',
                  fontWeight: '600',
                  borderRadius: 'var(--nbd-radius-md)',
                  minHeight: '44px'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              </button>
              
              {/* Botones existentes */}
              <div style={{ 
                display: 'flex', 
                gap: 'var(--nbd-space-xs)',
                width: '100%'
              }}>
                <button
                  onClick={goToHome}
                  className="nbd-btn"
                  style={{
                    backgroundColor: 'var(--nbd-neutral-100)',
                    color: 'var(--nbd-primary)',
                    border: '1px solid var(--nbd-neutral-300)',
                    flex: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--nbd-space-xs)',
                    padding: 'var(--nbd-space-sm)',
                    fontSize: 'var(--nbd-font-size-xs)',
                    fontWeight: '500',
                    borderRadius: 'var(--nbd-radius-md)',
                    minHeight: '40px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Volver a la tienda
                </button>
                <button
                  onClick={contactWhatsApp}
                  className="nbd-btn"
                  style={{
                    backgroundColor: '#25D366',
                    color: 'white',
                    border: 'none',
                    flex: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--nbd-space-xs)',
                    padding: 'var(--nbd-space-sm)',
                    fontSize: 'var(--nbd-font-size-xs)',
                    fontWeight: '500',
                    borderRadius: 'var(--nbd-radius-md)',
                    minHeight: '40px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Contactar por WhatsApp
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes nbd-loading-spin {
          0% {
            stroke-dashoffset: 175;
            transform: rotate(0deg);
          }
          50% {
            stroke-dashoffset: 50;
            transform: rotate(180deg);
          }
          100% {
            stroke-dashoffset: 175;
            transform: rotate(360deg);
          }
        }

        @keyframes nbd-success-bounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
