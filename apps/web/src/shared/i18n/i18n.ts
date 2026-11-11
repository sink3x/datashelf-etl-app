import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import {
	DEFAULT_LANGUAGE,
	INTL_LOCALES,
	LANGUAGE_QUERY_PARAM,
	LANGUAGE_STORAGE_KEY,
	SUPPORTED_LANGUAGES,
	type TLanguage,
} from './i18n.constants'
import en from './locales/en.json'
import ru from './locales/ru.json'

export const isSupportedLanguage = (value: unknown): value is TLanguage =>
	SUPPORTED_LANGUAGES.includes(value as TLanguage)

export const getCurrentLanguage = (): TLanguage =>
	isSupportedLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LANGUAGE

export const getIntlLocale = (language: TLanguage = getCurrentLanguage()) => INTL_LOCALES[language]

i18n.on('languageChanged', () => {
	document.documentElement.lang = getCurrentLanguage()
})

void i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: { translation: en },
			ru: { translation: ru },
		},
		supportedLngs: SUPPORTED_LANGUAGES,
		fallbackLng: DEFAULT_LANGUAGE,
		nonExplicitSupportedLngs: true,
		load: 'languageOnly',
		initAsync: false,
		interpolation: { escapeValue: false },
		react: { useSuspense: false },
		detection: {
			order: ['querystring', 'localStorage', 'navigator'],
			lookupQuerystring: LANGUAGE_QUERY_PARAM,
			lookupLocalStorage: LANGUAGE_STORAGE_KEY,
			caches: ['localStorage'],
		},
	})

export { i18n }
