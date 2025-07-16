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
  type TabType = 'info' | 'orders' | 'notes'
  const [activeTab, setActiveTab] = useState<TabType>('info')
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay de fondo */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
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
            
            <div className="flex items-center gap-2">
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
                <>
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
                </>
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

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            <div className="min-h-[400px]">
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
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600"
                              >
                                <span className="sr-only">Remove tag</span>
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            placeholder={t('details.addTagPlaceholder')}
                            className="block w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-gray-500 focus:border-gray-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            {t('details.addTag')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {tags.length > 0 ? (
                          tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">{t('details.noTags')}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Preferences */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">{t('details.preferences')}</h4>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.newsletter}
                            onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                            className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            {t('details.newsletterSubscription')}
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.notifyOrderStatus}
                            onChange={(e) => setPreferences({ ...preferences, notifyOrderStatus: e.target.checked })}
                            className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            {t('details.orderNotifications')}
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <svg className={`h-5 w-5 ${preferences.newsletter ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={preferences.newsletter ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className="ml-2 text-sm text-gray-900">{t('details.newsletterSubscription')}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className={`h-5 w-5 ${preferences.notifyOrderStatus ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={preferences.notifyOrderStatus ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className="ml-2 text-sm text-gray-900">{t('details.orderNotifications')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('details.noOrders')}</h3>
                    <p className="mt-1 text-sm text-gray-500">{t('details.noOrdersMessage')}</p>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="h-full">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">{t('details.internalNotes')}</h4>
                  {isEditing ? (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={12}
                      className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-gray-500 focus:border-gray-500"
                      placeholder={t('details.notePlaceholder')}
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
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
  )
} 