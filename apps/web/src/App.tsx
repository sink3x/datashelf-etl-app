import { ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import ruRU from 'antd/locale/ru_RU'
import { I18nextProvider } from 'react-i18next'
import { RouterProvider } from 'react-router-dom'

import { router } from '@router/create-router'

import { StrictModeWrapper } from '@components/StrictModeWrapper/StrictModeWrapper'
import { useLanguage } from '@hooks/use-language'
import { i18n } from '@shared/i18n/i18n'
import type { TLanguage } from '@shared/i18n/i18n.constants'
import { GlobalStyles } from '@styles/global/GlobalStyles'
import { antdTheme } from '@styles/theme'

import type { Locale } from 'antd/es/locale'

const ANTD_LOCALES: Record<TLanguage, Locale> = {
	en: enUS,
	ru: ruRU,
}

const LocalizedApp = () => {
	const { language } = useLanguage()

	return (
		<ConfigProvider theme={antdTheme} locale={ANTD_LOCALES[language]}>
			<GlobalStyles />
			<RouterProvider router={router} />
		</ConfigProvider>
	)
}

export const App = () => {
	return (
		<StrictModeWrapper>
			<I18nextProvider i18n={i18n}>
				<LocalizedApp />
			</I18nextProvider>
		</StrictModeWrapper>
	)
}
