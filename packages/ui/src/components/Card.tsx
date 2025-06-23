import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
}) => {
  const baseStyles = 'bg-white rounded-lg border';
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  const finalClassName = [
    baseStyles,
    paddingStyles[padding],
    shadowStyles[shadow],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={finalClassName}>
      {children}
    </div>
  );
}; 