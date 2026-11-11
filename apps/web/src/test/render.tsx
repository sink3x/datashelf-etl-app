import type { ReactElement } from 'react'

import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'

import { i18n } from '@shared/i18n/i18n'

export const renderWithI18n = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult =>
	render(ui, {
		...options,
		wrapper: ({ children }) => <I18nextProvider i18n={i18n}>{children}</I18nextProvider>,
	})
