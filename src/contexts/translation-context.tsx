'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'ml'

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, fallback?: string) => string
  isLoading: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

interface TranslationProviderProps {
  children: ReactNode
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguage] = useState<Language>('en')
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && ['en', 'ml'].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }

    loadTranslations()
  }, [])

  const loadTranslations = async () => {
    try {
      const response = await fetch('/api/translations')
      if (response.ok) {
        const data = await response.json()
        setTranslations(data.translations)
      }
    } catch (error) {
      console.error('Error loading translations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string, fallback?: string) => {
    if (isLoading) return fallback || key
    
    const translation = translations[key]?.[language]
    return translation || fallback || key
  }

  return (
    <TranslationContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      t,
      isLoading
    }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}