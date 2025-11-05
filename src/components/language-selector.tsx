'use client'

import { Button } from '@/components/ui/button'
import { 
  Globe, 
  Languages
} from 'lucide-react'
import { useTranslation } from '@/contexts/translation-context'

export default function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation()

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'ml')}
        className="px-2 py-1 text-sm border rounded-md bg-background"
      >
        <option value="en">{t('language.english', 'English')}</option>
        <option value="ml">{t('language.malayalam', 'മലയാളം')}</option>
      </select>
    </div>
  )
}