import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import viCommon from './locales/vi/common.json'

export const SUPPORTED_LANGUAGES = ['vi', 'en']
export const DEFAULT_LANGUAGE = 'vi'

i18n.use(initReactI18next).init({
  resources: {
    vi: { common: viCommon },
    en: { common: enCommon },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  ns: ['common'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
