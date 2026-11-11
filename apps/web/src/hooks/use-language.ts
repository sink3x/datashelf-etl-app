import { useTranslation } from 'react-i18next'

import { INTL_LOCALES, type TLanguage } from '@shared/i18n/i18n.constants'
import { toSupportedLanguage } from '@shared/i18n/i18n.utils'

export const useLanguage = () => {
	const { i18n } = useTranslation()

	const language = toSupportedLanguage(i18n.resolvedLanguage)

	return {
		language,
		intlLocale: INTL_LOCALES[language],
		changeLanguage: (nextLanguage: TLanguage) => i18n.changeLanguage(nextLanguage),
	}
}
