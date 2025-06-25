// Application URLs Configuration
export const APP_URLS = {
  LANDING: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_LANDING_URL || 'https://shopifree.app',
  DASHBOARD: process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001' 
    : process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.shopifree.app',
  ADMIN: process.env.NODE_ENV === 'development'
    ? 'http://localhost:3002'
    : process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.shopifree.app',
  PUBLIC_STORE: process.env.NODE_ENV === 'development'
    ? 'http://localhost:3003'
    : process.env.NEXT_PUBLIC_PUBLIC_STORE_URL || 'https://shopifree.app',
}

// Helper function to get landing URL with path
export const getLandingUrl = (path: string = '') => {
  return `${APP_URLS.LANDING}${path}`
}

// Helper function to get dashboard URL with path  
export const getDashboardUrl = (path: string = '') => {
  return `${APP_URLS.DASHBOARD}${path}`
} 