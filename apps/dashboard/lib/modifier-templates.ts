import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

// Tipos para Plantillas de Modificadores Reutilizables

export interface ModifierOption {
  id: string
  name: string
  priceModifier: number
  isDefault: boolean
  isActive: boolean
  order: number
}

export interface ModifierTemplate {
  id: string
  name: string
  required: boolean
  allowMultiple: boolean
  minSelections: number
  maxSelections: number
  options: ModifierOption[]
  createdAt: Date
  updatedAt: Date
  usageCount?: number  // Cuántos productos usan esta plantilla
}

// Referencia de plantilla en un producto
export interface ProductModifierReference {
  templateId: string | null  // Si es null, es un grupo personalizado
  order: number
  // Solo si templateId es null (grupo personalizado):
  customData?: {
    id: string
    name: string
    required: boolean
    allowMultiple: boolean
    minSelections: number
    maxSelections: number
    options: ModifierOption[]
  }
}

// ========================================
// Funciones de Firestore
// ========================================

/**
 * Obtener todas las plantillas de modificadores de una tienda
 */
export async function getModifierTemplates(storeId: string): Promise<ModifierTemplate[]> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not initialized')
  const templatesRef = collection(db, 'stores', storeId, 'modifierTemplates')
  const q = query(templatesRef, orderBy('name', 'asc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      required: data.required,
      allowMultiple: data.allowMultiple,
      minSelections: data.minSelections,
      maxSelections: data.maxSelections,
      options: data.options,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      usageCount: data.usageCount || 0
    }
  })
}

/**
 * Obtener una plantilla específica
 */
export async function getModifierTemplate(storeId: string, templateId: string): Promise<ModifierTemplate | null> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not initialized')
  const templateRef = doc(db, 'stores', storeId, 'modifierTemplates', templateId)
  const snapshot = await getDoc(templateRef)

  if (!snapshot.exists()) return null

  const data = snapshot.data()
  return {
    id: snapshot.id,
    name: data.name,
    required: data.required,
    allowMultiple: data.allowMultiple,
    minSelections: data.minSelections,
    maxSelections: data.maxSelections,
    options: data.options,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    usageCount: data.usageCount || 0
  }
}

/**
 * Crear una nueva plantilla
 */
export async function createModifierTemplate(
  storeId: string,
  template: Omit<ModifierTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
): Promise<string> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not initialized')
  const templatesRef = collection(db, 'stores', storeId, 'modifierTemplates')

  const docRef = await addDoc(templatesRef, {
    ...template,
    usageCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  return docRef.id
}

/**
 * Actualizar una plantilla existente
 */
export async function updateModifierTemplate(
  storeId: string,
  templateId: string,
  updates: Partial<Omit<ModifierTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not initialized')
  const templateRef = doc(db, 'stores', storeId, 'modifierTemplates', templateId)

  await updateDoc(templateRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Eliminar una plantilla
 */
export async function deleteModifierTemplate(storeId: string, templateId: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not initialized')
  const templateRef = doc(db, 'stores', storeId, 'modifierTemplates', templateId)
  await deleteDoc(templateRef)
}

/**
 * Resolver referencias de modificadores a sus datos completos
 * Compatible con formato antiguo (datos copiados) y nuevo (referencias)
 */
export async function resolveModifierReferences(
  storeId: string,
  modifierGroups: any[]
): Promise<any[]> {
  if (!modifierGroups || modifierGroups.length === 0) return []

  const resolved = await Promise.all(
    modifierGroups.map(async (group) => {
      // Formato nuevo: tiene templateId
      if (group.templateId) {
        const template = await getModifierTemplate(storeId, group.templateId)
        if (!template) {
          console.warn(`Template ${group.templateId} not found, skipping modifier group`)
          return null
        }
        return {
          id: template.id,
          name: template.name,
          required: template.required,
          allowMultiple: template.allowMultiple,
          minSelections: template.minSelections,
          maxSelections: template.maxSelections,
          options: template.options,
          order: group.order
        }
      }

      // Formato nuevo: tiene customData
      if (group.customData) {
        return {
          id: group.customData.id,
          name: group.customData.name,
          required: group.customData.required,
          allowMultiple: group.customData.allowMultiple,
          minSelections: group.customData.minSelections,
          maxSelections: group.customData.maxSelections,
          options: group.customData.options,
          order: group.order
        }
      }

      // Formato antiguo: datos directamente en el grupo (compatibilidad)
      // Si tiene 'name' y 'options' directamente, es formato antiguo
      if (group.name && group.options) {
        return group
      }

      return null
    })
  )

  return resolved.filter(Boolean).sort((a, b) => a.order - b.order)
}
