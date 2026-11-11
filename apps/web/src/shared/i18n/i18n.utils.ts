import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type TLanguage } from './i18n.constants'

export const isSupportedLanguage = (value: unknown): value is TLanguage =>
	SUPPORTED_LANGUAGES.includes(value as TLanguage)

export const toSupportedLanguage = (value: unknown): TLanguage =>
	isSupportedLanguage(value) ? value : DEFAULT_LANGUAGE

export const getNativeLanguageName = (language: TLanguage) => {
	const name = new Intl.DisplayNames([language], { type: 'language' }).of(language) ?? language

	return name.charAt(0).toLocaleUpperCase(language) + name.slice(1)
}
