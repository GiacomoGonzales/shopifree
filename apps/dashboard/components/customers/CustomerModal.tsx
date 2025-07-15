'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Timestamp } from 'firebase/firestore'
import { 
  updateCustomer, 
  type CustomerWithId 
} from '../../lib/customers'

interface CustomerModalProps {
  customer: CustomerWithId
  storeId: string
  isOpen: boolean
  onClose: () => void
  onCustomerUpdated: (customer: CustomerWithId) => void
}

export default function CustomerModal({ 
  customer, 
  storeId, 
  isOpen, 
  onClose, 
  onCustomerUpdated 
}: CustomerModalProps) {
  const t = useTranslations('pages.customers')
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'notes'>('info')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [notes, setNotes] = useState(customer.notes || '')
  const [tags, setTags] = useState<string[]>(customer.tags || [])
  const [preferences, setPreferences] = useState({
    newsletter: customer.preferences?.newsletter || false,
    notifyOrderStatus: customer.preferences?.notifyOrderStatus || false
  })

  // Reset state when customer changes
  useEffect(() => {
    setNotes(customer.notes || '')
    setTags(customer.tags || [])
    setPreferences({
      newsletter: customer.preferences?.newsletter || false,
      notifyOrderStatus: customer.preferences?.notifyOrderStatus || false
    })
    setIsEditing(false)
    setActiveTab('info')
  }, [customer])

  // Format date helper
  const formatDate = (timestamp: Timestamp | Date | string | null | undefined) => {
    if (!timestamp) return t('table.never')
    
    try {
      const date = (timestamp as Timestamp).toDate ? (timestamp as Timestamp).toDate() : new Date(timestamp as string | Date)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return t('table.never')
    }
  }

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  // Add tag function
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  // Remove tag function
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Save changes function
  const handleSave = async () => {
    try {
      setSaving(true)
      
      const updates = {
        notes,
        tags,
        preferences
      }

      await updateCustomer(storeId, customer.id, updates)
      
      // Update the customer object with new data
      const updatedCustomer = {
        ...customer,
        ...updates
      }
      
      onCustomerUpdated(updatedCustomer)
      setIsEditing(false)
      
    } catch (error) {
      console.error('Error updating customer:', error)
    } finally {
      setSaving(false)
    }
  }

  // Cancel editing
  const handleCancel = () => {
    setNotes(customer.notes || '')
    setTags(customer.tags || [])
    setPreferences({
      newsletter: customer.preferences?.newsletter || false,
      notifyOrderStatus: customer.preferences?.notifyOrderStatus || false
    })
    setIsEditing(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-white shadow-sm">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-700">
                    {customer.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {customer.displayName}
                  </h3>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    title="Editar cliente"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                ) : (
                  <div className="flex space-x-1">
                    <button
                      onClick={handleCancel}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="Cancelar"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="p-2 text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      title={saving ? "Guardando..." : "Guardar"}
                    >
                      {saving ? (
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Cerrar"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('details.personalInfo')}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('details.orderHistory')}
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notes'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('details.internalNotes')}
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 flex-1 overflow-y-auto">
            <div className="h-full min-h-[600px]">
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">{t('details.personalInfo')}</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('details.name')}</label>
                      <div className="mt-1 text-sm text-gray-900">{customer.displayName}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('details.email')}</label>
                      <div className="mt-1 text-sm text-gray-900">{customer.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('details.phone')}</label>
                      <div className="mt-1 text-sm text-gray-900">{customer.phone || '—'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('details.registrationDate')}</label>
                      <div className="mt-1 text-sm text-gray-900">{formatDate(customer.joinedAt || customer.createdAt)}</div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">{t('details.statistics')}</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(customer.totalSpent || 0)}</div>
                      <div className="text-sm text-gray-500">{t('details.totalSpent')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{customer.orderCount || 0}</div>
                      <div className="text-sm text-gray-500">{t('details.orderCount')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {(customer.orderCount || 0) > 0 ? formatCurrency((customer.totalSpent || 0) / (customer.orderCount || 1)) : formatCurrency(0)}
                      </div>
                      <div className="text-sm text-gray-500">{t('details.averageOrderValue')}</div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">{t('details.tags')}</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </span>
                    ))}
                    {tags.length === 0 && (
                      <span className="text-sm text-gray-500">Sin etiquetas</span>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder={t('details.tagPlaceholder')}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <button
                        onClick={handleAddTag}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                      >
                        {t('details.addTag')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Preferences */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">{t('details.preferences')}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="newsletter"
                        type="checkbox"
                        checked={preferences.newsletter}
                        onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                        disabled={!isEditing}
                        className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-900">
                        {t('details.newsletter')}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="notifications"
                        type="checkbox"
                        checked={preferences.notifyOrderStatus}
                        onChange={(e) => setPreferences({ ...preferences, notifyOrderStatus: e.target.checked })}
                        disabled={!isEditing}
                        className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                        {t('details.notifications')}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">{t('details.orderHistory')}</h4>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{t('details.noOrders')}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t('details.noOrdersMessage')}</p>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">{t('details.internalNotes')}</h4>
                {isEditing ? (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder={t('details.notePlaceholder')}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                    {notes ? (
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{notes}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">{t('details.notePlaceholder')}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
} 