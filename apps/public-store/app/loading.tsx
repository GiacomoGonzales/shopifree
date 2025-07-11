import { LOADING_CONFIG } from '../lib/loading-config'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 mx-auto mb-3"></div>
        <p className="text-neutral-600 font-light">{LOADING_CONFIG.LOADING_MESSAGES.store}</p>
      </div>
    </div>
  )
} 