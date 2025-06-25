import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

/**
 * Script de migración para actualizar tiendas existentes
 * Convierte el campo 'slug' a 'subdomain' en todas las tiendas que no tengan subdomain
 */
export async function migrateStoresToSubdomain() {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    console.log('🚀 Iniciando migración de tiendas...')

    // Obtener todas las tiendas
    const storesRef = collection(db, 'stores')
    const querySnapshot = await getDocs(storesRef)

    let migratedCount = 0
    let skippedCount = 0

    for (const storeDoc of querySnapshot.docs) {
      const storeData = storeDoc.data()
      
      // Si ya tiene subdomain, saltar
      if (storeData.subdomain) {
        console.log(`⏭️ Tienda ${storeDoc.id} ya tiene subdomain: ${storeData.subdomain}`)
        skippedCount++
        continue
      }

      // Si tiene slug, migrar a subdomain
      if (storeData.slug) {
        console.log(`🔄 Migrando tienda ${storeDoc.id}: ${storeData.slug} -> subdomain`)
        
        await updateDoc(doc(db, 'stores', storeDoc.id), {
          subdomain: storeData.slug,
          updatedAt: new Date()
        })
        
        migratedCount++
        console.log(`✅ Migrada tienda ${storeDoc.id}`)
      } else {
        console.warn(`⚠️ Tienda ${storeDoc.id} no tiene ni slug ni subdomain`)
      }
    }

    console.log(`🎉 Migración completada!`)
    console.log(`✅ Tiendas migradas: ${migratedCount}`)
    console.log(`⏭️ Tiendas omitidas (ya tenían subdomain): ${skippedCount}`)
    console.log(`📊 Total tiendas procesadas: ${querySnapshot.docs.length}`)

    return {
      success: true,
      migrated: migratedCount,
      skipped: skippedCount,
      total: querySnapshot.docs.length
    }

  } catch (error) {
    console.error('❌ Error en migración:', error)
    throw error
  }
}

/**
 * Verificar duplicados de subdomain después de la migración
 */
export async function checkSubdomainDuplicates() {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase database not available')
    }

    console.log('🔍 Verificando duplicados de subdomain...')

    const storesRef = collection(db, 'stores')
    const querySnapshot = await getDocs(storesRef)

    const subdomains = new Map<string, string[]>()

    querySnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.subdomain) {
        if (!subdomains.has(data.subdomain)) {
          subdomains.set(data.subdomain, [])
        }
        subdomains.get(data.subdomain)!.push(doc.id)
      }
    })

    const duplicates = Array.from(subdomains.entries()).filter(([_, ids]) => ids.length > 1)

    if (duplicates.length > 0) {
      console.warn('⚠️ Se encontraron subdominios duplicados:')
      duplicates.forEach(([subdomain, ids]) => {
        console.warn(`   ${subdomain}: ${ids.join(', ')}`)
      })
    } else {
      console.log('✅ No se encontraron duplicados')
    }

    return duplicates

  } catch (error) {
    console.error('❌ Error verificando duplicados:', error)
    throw error
  }
} 