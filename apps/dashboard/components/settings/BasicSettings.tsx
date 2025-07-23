'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { StoreWithId } from '../../lib/store'
import { brandColors } from '@shopifree/ui'
import PaymentsSection from './PaymentsSection'
import StoreInfoSection from './StoreInfoSection'
import ContactSection from './ContactSection'

interface BasicSettingsProps {
  store: StoreWithId
  onUpdate: (data: Partial<StoreWithId>) => Promise<boolean>
  saving?: boolean
}

export default function BasicSettings({ store, onUpdate, saving }: BasicSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Información de la tienda */}
      <StoreInfoSection />

      {/* Contacto */}
      <ContactSection />

      {/* Pasarela de Pago */}
      <PaymentsSection store={store} onUpdate={onUpdate} />
    </div>
  )
} 