import type { FC } from 'react'

import { useTranslation } from 'react-i18next'

import { useLanguage } from '@hooks/use-language'
import { SUPPORTED_LANGUAGES, type TLanguage } from '@shared/i18n/i18n.constants'
import { getNativeLanguageName } from '@shared/i18n/i18n.utils'

import * as Styled from './LanguageSwitcher.styles'

import type { ILanguageSwitcherProps } from './LanguageSwitcher.interfaces'

const LANGUAGE_OPTIONS = SUPPORTED_LANGUAGES.map((language) => {
	const nativeName = getNativeLanguageName(language)

	return {
		value: language,
		title: nativeName,
		label: (
			<>
				<span aria-hidden>{language.toUpperCase()}</span>
				<Styled.VisuallyHidden lang={language}>{nativeName}</Styled.VisuallyHidden>
			</>
		),
	}
})

export const LanguageSwitcher: FC<ILanguageSwitcherProps> = (props) => {
	const { className } = props

	const { t } = useTranslation()
	const { language, changeLanguage } = useLanguage()

	return (
		<Styled.Switcher<TLanguage>
			className={className}
			size="small"
			aria-label={t('language.switcherLabel')}
			value={language}
			options={LANGUAGE_OPTIONS}
			onChange={(nextLanguage) => void changeLanguage(nextLanguage)}
		/>
	)
}
