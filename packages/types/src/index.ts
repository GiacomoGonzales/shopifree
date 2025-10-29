// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// Store types
export interface Store {
  id: string;
  subdomain: string;
  storeName: string;
  slogan?: string;
  description?: string;
  hasPhysicalLocation: boolean;
  address?: string;
  location?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
  phone: string;
  emailStore?: string;
  currency: string;
  logoUrl?: string;
  heroImageUrl?: string;
  storefrontImageUrl?: string;
  headerLogoUrl?: string;
  carouselImages?: Array<{
    url: string;
    publicId: string;
    order: number;
  }>;
  primaryColor: string;
  secondaryColor: string;
  socialMedia?: {
    [key: string]: string | undefined;
  };
  logo?: string; // Legacy
  logoPublicId?: string;
  storefrontImagePublicId?: string;
  headerLogoPublicId?: string;
  storePhoto?: string; // Legacy
  businessType?: string;
  ownerId: string;
  theme: StoreTheme;
  settings: StoreSettings;
  hasSeenWelcome?: boolean; // Track if user has seen initial welcome message
}

export interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layout: 'modern' | 'classic' | 'minimal';
}

export interface StoreSettings {
  isActive: boolean;
  allowGuestCheckout: boolean;
  currency: string;
  language: string;
  paymentMethods: string[];
  shippingZones: ShippingZone[];
}

// Product types
export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  images: string[];
  category: ProductCategory;
  variants?: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  values: string[];
  price?: number;
  stock?: number;
  sku?: string;
}

// Order types
export interface Order {
  id: string;
  storeId: string;
  customerId?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  total: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Address types
export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Shipping types
export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  methods: ShippingMethod[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  cost: number;
  estimatedDays: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 