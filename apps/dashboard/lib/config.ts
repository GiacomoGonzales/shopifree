// Application URLs Configuration
export const APP_URLS = {
  LANDING: process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:3000',
  DASHBOARD: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001',
  ADMIN: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002',
  PUBLIC_STORE: process.env.NEXT_PUBLIC_PUBLIC_STORE_URL || 'http://localhost:3003',
}

// Helper function to get landing URL with path
export const getLandingUrl = (path: string = '') => {
  return `${APP_URLS.LANDING}${path}`
}

// Helper function to get dashboard URL with path  
export const getDashboardUrl = (path: string = '') => {
  return `${APP_URLS.DASHBOARD}${path}`
} 