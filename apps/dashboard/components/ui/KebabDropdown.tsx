'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Z_INDEX } from '../../lib/z-index'

interface DropdownItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

interface KebabDropdownProps {
  items: DropdownItem[]
  id: string
  className?: string
  buttonClassName?: string
}

interface Position {
  top: number
  left: number
  right?: number
}

/**
 * Hook para manejar el estado del dropdown de manera optimizada
 */
function useDropdown(id: string) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  // Calcular posición optimizada
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Dropdown dimensions (estimated)
    const dropdownWidth = 192 // w-48 = 12rem = 192px
    const dropdownHeight = 200 // estimated max height

    let top = triggerRect.bottom + 8
    let left = triggerRect.right - dropdownWidth

    // Ajustar si se sale del viewport por abajo
    if (top + dropdownHeight > viewportHeight) {
      top = triggerRect.top - dropdownHeight - 8
    }

    // Ajustar si se sale del viewport por la izquierda
    if (left < 8) {
      left = triggerRect.left
    }

    // Ajustar si se sale del viewport por la derecha
    if (left + dropdownWidth > viewportWidth - 8) {
      left = viewportWidth - dropdownWidth - 8
    }

    setPosition({ top, left })
  }, [])

  // Abrir dropdown
  const openDropdown = useCallback(() => {
    calculatePosition()
    setIsOpen(true)
  }, [calculatePosition])

  // Cerrar dropdown
  const closeDropdown = useCallback(() => {
    setIsOpen(false)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  // Toggle dropdown
  const toggleDropdown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    if (isOpen) {
      closeDropdown()
    } else {
      openDropdown()
    }
  }, [isOpen, openDropdown, closeDropdown])

  // Manejar scroll/resize con requestAnimationFrame
  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      calculatePosition()
      animationFrameRef.current = requestAnimationFrame(updatePosition)
    }

    const handleScrollResize = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(updatePosition)
    }

    // Listeners optimizados
    window.addEventListener('scroll', handleScrollResize, { passive: true })
    window.addEventListener('resize', handleScrollResize, { passive: true })

    // Iniciar loop de posicionamiento
    animationFrameRef.current = requestAnimationFrame(updatePosition)

    return () => {
      window.removeEventListener('scroll', handleScrollResize)
      window.removeEventListener('resize', handleScrollResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isOpen, calculatePosition])

  // Manejar click fuera y escape
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return
      }

      closeDropdown()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown()
        triggerRef.current?.focus()
      }
    }

    // Delay para evitar cierre inmediato en el mismo click que abre
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeDropdown])

  return {
    isOpen,
    position,
    triggerRef,
    dropdownRef,
    toggleDropdown,
    closeDropdown
  }
}

/**
 * Componente Dropdown reutilizable con menú kebab
 */
export default function KebabDropdown({
  items,
  id,
  className = "",
  buttonClassName = ""
}: KebabDropdownProps) {
  const {
    isOpen,
    position,
    triggerRef,
    dropdownRef,
    toggleDropdown,
    closeDropdown
  } = useDropdown(id)

  // Handle item click
  const handleItemClick = useCallback((item: DropdownItem) => {
    if (item.disabled) return

    item.onClick()
    closeDropdown()
  }, [closeDropdown])

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={toggleDropdown}
        className={`
          p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100
          rounded-lg transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          ${buttonClassName}
        `}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Opciones"
        type="button"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {/* Portal Dropdown */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-xl"
          style={{
            top: position.top,
            left: position.left,
            zIndex: Z_INDEX.DROPDOWN
          }}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`
                  flex items-center w-full px-4 py-2 text-sm text-left
                  transition-colors duration-150
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                  ${item.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50 focus:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100'
                  }
                  ${item.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                  }
                `}
                role="menuitem"
                tabIndex={0}
              >
                {item.icon && (
                  <span className="w-4 h-4 mr-3 flex-shrink-0">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// Export hook para casos avanzados
export { useDropdown }