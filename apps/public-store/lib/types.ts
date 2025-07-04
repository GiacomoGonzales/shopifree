export interface Tienda {
  id: string
  storeName: string
  subdomain: string
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
}

export interface ThemeProps {
  tienda: Tienda
} 