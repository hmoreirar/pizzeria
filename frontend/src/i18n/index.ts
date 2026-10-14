import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { es } from './locales/es'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    // React already escapes interpolated values.
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'pizzeria.lang',
      caches: ['localStorage'],
    },
  })

// Keep <html lang> in sync for accessibility and SEO.
function syncHtmlLang() {
  document.documentElement.lang = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'es'
}
i18n.on('languageChanged', syncHtmlLang)
syncHtmlLang()

export default i18n
