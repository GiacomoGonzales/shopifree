import { 
  doc, 
  getDoc, 
  getDocs,
  updateDoc,
  deleteDoc,
  query, 
  collection, 
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  addDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

// Customer data structure as per requirements
export interface Customer {
  uid?: string
  displayName: string
  email: string
  phone?: string
  address?: string
  joinedAt?: Timestamp
  lastActivity?: Timestamp
  createdAt?: Timestamp
  lastOrderAt?: Timestamp
  orderCount?: number
  totalSpent?: number
  tags?: string[]
  notes?: string
  location?: {
    address: string
    lat: number
    lng: number
  }
  preferences?: {
    newsletter: boolean
    notifyOrderStatus?: boolean
  }
}

export interface CustomerWithId extends Customer {
  id: string
}

// Filter and sort options
export interface CustomerFilters {
  searchQuery?: string
  tags?: string[]
  minSpent?: number
  maxSpent?: number
  minOrders?: number
  maxOrders?: number
  sortBy?: CustomerSortOption
}

export type CustomerSortOption = 
  | 'name-asc' 
  | 'name-desc' 
  | 'email-asc' 
  | 'email-desc'
  | 'totalSpent-asc' 
  | 'totalSpent-desc'
  | 'orderCount-asc' 
  | 'orderCount-desc'
  | 'lastOrder-asc' 
  | 'lastOrder-desc'
  | 'created-asc' 
  | 'created-desc'

// Pagination result
export interface CustomerPaginationResult {
  customers: CustomerWithId[]
  totalPages: number
  currentPage: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Get all customers for a store with pagination and filters
 */
export async function getCustomers(
  storeId: string,
  filters: CustomerFilters = {},
  page: number = 1,
  itemsPerPage: number = 15
): Promise<CustomerPaginationResult> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const customersRef = collection(db, 'stores', storeId, 'customers')
    
    // Para evitar problemas con ordenación, primero obtenemos todos los documentos
    // y luego aplicamos ordenación y filtros en el cliente
    const snapshot = await getDocs(customersRef)
    let customers: CustomerWithId[] = []

    snapshot.forEach((doc) => {
      const data = doc.data() as Customer
      customers.push({
        id: doc.id,
        ...data
      })
    })

    console.log('Raw customers from Firestore:', customers)

    // Apply client-side filters
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      customers = customers.filter(customer => 
        customer.displayName?.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        (customer.phone && customer.phone.includes(searchTerm))
      )
    }

    if (filters.tags && filters.tags.length > 0) {
      customers = customers.filter(customer => 
        customer.tags && filters.tags!.some(tag => customer.tags!.includes(tag))
      )
    }

    if (filters.minSpent !== undefined) {
      customers = customers.filter(customer => (customer.totalSpent || 0) >= filters.minSpent!)
    }

    if (filters.maxSpent !== undefined) {
      customers = customers.filter(customer => (customer.totalSpent || 0) <= filters.maxSpent!)
    }

    if (filters.minOrders !== undefined) {
      customers = customers.filter(customer => (customer.orderCount || 0) >= filters.minOrders!)
    }

    if (filters.maxOrders !== undefined) {
      customers = customers.filter(customer => (customer.orderCount || 0) <= filters.maxOrders!)
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'created-desc'
    customers.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.displayName || '').localeCompare(b.displayName || '')
        case 'name-desc':
          return (b.displayName || '').localeCompare(a.displayName || '')
        case 'email-asc':
          return (a.email || '').localeCompare(b.email || '')
        case 'email-desc':
          return (b.email || '').localeCompare(a.email || '')
        case 'totalSpent-asc':
          return (a.totalSpent || 0) - (b.totalSpent || 0)
        case 'totalSpent-desc':
          return (b.totalSpent || 0) - (a.totalSpent || 0)
        case 'orderCount-asc':
          return (a.orderCount || 0) - (b.orderCount || 0)
        case 'orderCount-desc':
          return (b.orderCount || 0) - (a.orderCount || 0)
        case 'lastOrder-asc':
          const aLastOrder = a.lastOrderAt || a.lastActivity
          const bLastOrder = b.lastOrderAt || b.lastActivity
          if (!aLastOrder && !bLastOrder) return 0
          if (!aLastOrder) return 1
          if (!bLastOrder) return -1
          return aLastOrder.toDate().getTime() - bLastOrder.toDate().getTime()
        case 'lastOrder-desc':
          const aLastOrderDesc = a.lastOrderAt || a.lastActivity
          const bLastOrderDesc = b.lastOrderAt || b.lastActivity
          if (!aLastOrderDesc && !bLastOrderDesc) return 0
          if (!aLastOrderDesc) return 1
          if (!bLastOrderDesc) return -1
          return bLastOrderDesc.toDate().getTime() - aLastOrderDesc.toDate().getTime()
        case 'created-asc':
          const aCreated = a.createdAt || a.joinedAt
          const bCreated = b.createdAt || b.joinedAt
          if (!aCreated && !bCreated) return 0
          if (!aCreated) return 1
          if (!bCreated) return -1
          return aCreated.toDate().getTime() - bCreated.toDate().getTime()
        case 'created-desc':
        default:
          const aCreatedDesc = a.createdAt || a.joinedAt
          const bCreatedDesc = b.createdAt || b.joinedAt
          if (!aCreatedDesc && !bCreatedDesc) return 0
          if (!aCreatedDesc) return 1
          if (!bCreatedDesc) return -1
          return bCreatedDesc.toDate().getTime() - aCreatedDesc.toDate().getTime()
      }
    })

    console.log('Filtered and sorted customers:', customers)

    // Calculate pagination
    const totalItems = customers.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedCustomers = customers.slice(startIndex, endIndex)

    console.log('Paginated customers:', paginatedCustomers)

    return {
      customers: paginatedCustomers,
      totalPages,
      currentPage: page,
      totalItems,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw error
  }
}

/**
 * Get a single customer by ID
 */
export async function getCustomer(storeId: string, customerId: string): Promise<CustomerWithId | null> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const customerRef = doc(db, 'stores', storeId, 'customers', customerId)
    const customerSnap = await getDoc(customerRef)

    if (!customerSnap.exists()) {
      return null
    }

    return {
      id: customerSnap.id,
      ...customerSnap.data() as Customer
    }
  } catch (error) {
    console.error('Error fetching customer:', error)
    throw error
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(storeId: string, customerData: Omit<Customer, 'uid' | 'joinedAt' | 'orderCount' | 'totalSpent'>): Promise<string> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const customersRef = collection(db, 'stores', storeId, 'customers')
    
    const newCustomer = {
      ...customerData,
      joinedAt: serverTimestamp() as Timestamp,
      orderCount: 0,
      totalSpent: 0,
      tags: customerData.tags || [],
      preferences: customerData.preferences || {
        newsletter: true,
        notifyOrderStatus: true
      }
    }

    const docRef = await addDoc(customersRef, newCustomer)
    
    // Update the document with its own ID as uid
    await updateDoc(docRef, {
      uid: docRef.id
    })

    return docRef.id
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}

/**
 * Update a customer
 */
export async function updateCustomer(storeId: string, customerId: string, updates: Partial<Customer>): Promise<void> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const customerRef = doc(db, 'stores', storeId, 'customers', customerId)
    await updateDoc(customerRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating customer:', error)
    throw error
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(storeId: string, customerId: string): Promise<void> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const customerRef = doc(db, 'stores', storeId, 'customers', customerId)
    await deleteDoc(customerRef)
  } catch (error) {
    console.error('Error deleting customer:', error)
    throw error
  }
}

/**
 * Get customer statistics
 */
export async function getCustomerStats(storeId: string): Promise<{
  totalCustomers: number
  newThisMonth: number
  averageOrderValue: number
  topSpenders: CustomerWithId[]
}> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const customersRef = collection(db, 'stores', storeId, 'customers')
    const snapshot = await getDocs(customersRef)

    const customers: CustomerWithId[] = []
    snapshot.forEach((doc) => {
      customers.push({
        id: doc.id,
        ...doc.data() as Customer
      })
    })

    const totalCustomers = customers.length
    
    // Calculate new customers this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const newThisMonth = customers.filter(customer => {
      const joinedDate = customer.joinedAt || customer.createdAt
      if (!joinedDate) return false
      const date = joinedDate.toDate()
      return date >= thisMonth
    }).length

    // Calculate average order value
    const totalSpent = customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0)
    const totalOrders = customers.reduce((sum, customer) => sum + (customer.orderCount || 0), 0)
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

    // Get top 5 spenders
    const topSpenders = customers
      .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
      .slice(0, 5)

    return {
      totalCustomers,
      newThisMonth,
      averageOrderValue,
      topSpenders
    }
  } catch (error) {
    console.error('Error getting customer stats:', error)
    throw error
  }
}

/**
 * Get all unique tags used by customers
 */
export async function getCustomerTags(storeId: string): Promise<string[]> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const customersRef = collection(db, 'stores', storeId, 'customers')
    const snapshot = await getDocs(customersRef)

    const allTags = new Set<string>()
    snapshot.forEach((doc) => {
      const customer = doc.data() as Customer
      if (customer.tags) {
        customer.tags.forEach(tag => allTags.add(tag))
      }
    })

    return Array.from(allTags).sort()
  } catch (error) {
    console.error('Error getting customer tags:', error)
    throw error
  }
}

/**
 * Bulk update customers (for batch operations)
 */
export async function bulkUpdateCustomers(
  storeId: string, 
  updates: Array<{ customerId: string; data: Partial<Customer> }>
): Promise<void> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    const batch = writeBatch(db)

    updates.forEach(({ customerId, data }) => {
      const customerRef = doc(db, 'stores', storeId, 'customers', customerId)
      batch.update(customerRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
    })

    await batch.commit()
  } catch (error) {
    console.error('Error bulk updating customers:', error)
    throw error
  }
}

/**
 * Export customers to CSV format
 */
export async function exportCustomersToCSV(storeId: string): Promise<string> {
  try {
    const result = await getCustomers(storeId, {}, 1, 10000) // Get all customers
    const customers = result.customers

    const headers = [
      'Nombre',
      'Email',
      'Teléfono',
      'Fecha de Registro',
      'Última Actividad',
      'Cantidad de Pedidos',
      'Total Gastado',
      'Etiquetas',
      'Notas',
      'Dirección'
    ]

    const csvRows = [headers.join(',')]

    customers.forEach(customer => {
      const joinedDate = customer.joinedAt || customer.createdAt
      const lastActivity = customer.lastActivity || customer.lastOrderAt
      const row = [
        `"${customer.displayName || ''}"`,
        `"${customer.email || ''}"`,
        `"${customer.phone || ''}"`,
        `"${joinedDate ? joinedDate.toDate().toLocaleDateString() : 'N/A'}"`,
        `"${lastActivity ? lastActivity.toDate().toLocaleDateString() : 'N/A'}"`,
        (customer.orderCount || 0).toString(),
        (customer.totalSpent || 0).toFixed(2),
        `"${customer.tags ? customer.tags.join(', ') : ''}"`,
        `"${customer.notes || ''}"`,
        `"${customer.address || (customer.location?.address || '')}"`
      ]
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  } catch (error) {
    console.error('Error exporting customers to CSV:', error)
    throw error
  }
} 