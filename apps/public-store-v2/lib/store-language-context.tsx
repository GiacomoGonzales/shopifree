'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { StoreLanguage, getStoreTexts, StoreTexts } from './store-texts';

interface StoreLanguageContextType {
  language: StoreLanguage;
  texts: StoreTexts;
  t: (key: keyof StoreTexts) => string;
}

const StoreLanguageContext = createContext<StoreLanguageContextType | undefined>(undefined);

interface StoreLanguageProviderProps {
  children: ReactNode;
  language: StoreLanguage;
}

export function StoreLanguageProvider({ children, language }: StoreLanguageProviderProps) {
  const texts = getStoreTexts(language);
  
  const contextValue: StoreLanguageContextType = {
    language,
    texts,
    t: (key: keyof StoreTexts) => texts[key]
  };

  return (
    <StoreLanguageContext.Provider value={contextValue}>
      {children}
    </StoreLanguageContext.Provider>
  );
}

export function useStoreLanguage(): StoreLanguageContextType {
  const context = useContext(StoreLanguageContext);
  if (context === undefined) {
    throw new Error('useStoreLanguage must be used within a StoreLanguageProvider');
  }
  return context;
}