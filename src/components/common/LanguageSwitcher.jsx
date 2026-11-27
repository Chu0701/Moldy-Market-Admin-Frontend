import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const nextLang = i18n.language === 'en' ? 'vi' : 'en'

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void i18n.changeLanguage(nextLang)}
      aria-label={t('language.label')}
    >
      <Languages aria-hidden="true" className="size-3.5" />
      <span>{i18n.language === 'en' ? 'EN' : 'VI'}</span>
    </Button>
  )
}
