export interface Tienda {
  id: string
  storeName: string
  subdomain: string
  slug?: string
  slogan: string
  description: string
  theme: string
  hasPhysicalLocation: boolean
  address?: string
  logoUrl?: string
  storefrontImageUrl?: string
  primaryColor: string
  secondaryColor: string
  currency: string
  phone: string
  emailStore?: string
  ownerId: string
  advanced?: {
    language?: string
    checkout?: {
      method: 'whatsapp' | 'traditional'
    }
    payments?: {
      provider?: string
      publicKey?: string
      connected?: boolean
    }
    shipping?: {
      enabled?: boolean
      cost?: number
    }
  }
  socialMedia?: {
    facebook?: string
    instagram?: string
    whatsapp?: string
    tiktok?: string
    x?: string
    snapchat?: string
    linkedin?: string
    telegram?: string
    youtube?: string
    pinterest?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface ThemeProps {
  tienda: Tienda
} 