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
    <nav className={`flex text-sm text-neutral-500 font-light ${className}`}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          {index > 0 && (
            <span className="mx-2 text-neutral-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
          
          {item.isActive ? (
            <span className="text-neutral-900 font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          ) : (
            <Link 
              href={item.href} 
              className="hover:text-neutral-900 transition-colors duration-200 truncate max-w-[150px]"
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