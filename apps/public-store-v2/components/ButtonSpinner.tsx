"use client";

interface ButtonSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ButtonSpinner({ size = 'md', className = "" }: ButtonSpinnerProps) {
  const sizeClasses = {
    sm: 'w-3 h-3 border',
    md: 'w-4 h-4 border-2',
    lg: 'w-5 h-5 border-2'
  };

  return (
    <div
      className={`${sizeClasses[size]} border-current border-t-transparent rounded-full animate-spin flex-shrink-0 ${className}`}
      role="status"
      aria-label="Cargando..."
    />
  );
}