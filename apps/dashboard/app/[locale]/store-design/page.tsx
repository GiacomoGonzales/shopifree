'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function StoreDesignPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'es'

  useEffect(() => {
    router.replace(`/${locale}/store-design/branding`)
  }, [router, locale])

  return null
} 