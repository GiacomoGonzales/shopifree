import React, { ReactNode } from 'react';
import { StoreLanguage } from './store-texts';
import { StoreLanguageProvider } from './store-language-context';

interface StoreLanguageRootProps {
  children: ReactNode;
  language: StoreLanguage;
}

export function StoreLanguageRoot({ children, language }: StoreLanguageRootProps) {
  return (
    <StoreLanguageProvider language={language}>
      {children}
    </StoreLanguageProvider>
  );
}