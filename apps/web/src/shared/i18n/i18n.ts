import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import {
	DEFAULT_LANGUAGE,
	LANGUAGE_QUERY_PARAM,
	LANGUAGE_STORAGE_KEY,
	SUPPORTED_LANGUAGES,
} from './i18n.constants'
import { toSupportedLanguage } from './i18n.utils'
import en from './locales/en.json'
import ru from './locales/ru.json'

i18n.on('languageChanged', () => {
	document.documentElement.lang = toSupportedLanguage(i18n.resolvedLanguage)
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
