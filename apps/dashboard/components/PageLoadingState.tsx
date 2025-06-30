'use client'

interface PageLoadingStateProps {
  message?: string
}

export default function PageLoadingState({ message = "Cargando..." }: PageLoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-2 text-gray-600 font-light">{message}</p>
      </div>
    </div>
  )
} 