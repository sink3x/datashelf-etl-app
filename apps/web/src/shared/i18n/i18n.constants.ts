export const SUPPORTED_LANGUAGES = ['en', 'ru'] as const

export type TLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: TLanguage = 'en'

export const LANGUAGE_QUERY_PARAM = 'lng'
export const LANGUAGE_STORAGE_KEY = 'datashelf.language'

export const INTL_LOCALES: Record<TLanguage, string> = {
	en: 'en-US',
	ru: 'ru-RU',
}
