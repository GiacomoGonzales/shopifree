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
  heroImageUrl?: string
  storefrontImageUrl?: string
  headerLogoUrl?: string
  carouselImages?: Array<{
    url: string
    publicId: string
    order: number
  }>
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
      modes?: {
        storePickup?: boolean
        localDelivery?: boolean
        nationalShipping?: boolean
        internationalShipping?: boolean
      }
      localDelivery?: {
        enabled?: boolean
      }
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