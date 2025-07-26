import Link from 'next/link'
import { BreadcrumbItem } from '../lib/hooks/useBreadcrumbs'

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

const Breadcrumbs = ({ items, className = '' }: BreadcrumbsProps) => {
  if (items.length <= 1) {
    return null // No mostrar breadcrumbs si solo hay un elemento
  }

  return (
    <nav 
      className={`flex text-sm font-light ${className}`}
      style={{
        color: `rgb(var(--theme-neutral-medium))`,
        fontFamily: `var(--theme-font-body)`
      }}
    >
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          {index > 0 && (
            <span 
              className="mx-2"
              style={{ color: `rgb(var(--theme-neutral-medium) / 0.5)` }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
          
          {item.isActive ? (
            <span 
              className="font-medium truncate max-w-[200px]"
              style={{
                color: `rgb(var(--theme-neutral-dark))`,
                fontFamily: `var(--theme-font-body)`,
                fontWeight: '500'
              }}
            >
              {item.label}
            </span>
          ) : (
            <Link 
              href={item.href} 
              className="truncate max-w-[150px] transition-colors duration-200"
              style={{
                color: `rgb(var(--theme-neutral-medium))`,
                fontFamily: `var(--theme-font-body)`,
                transition: `var(--theme-transition)`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = `rgb(var(--theme-accent))`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = `rgb(var(--theme-neutral-medium))`
              }}
              title={item.label}
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumbs 