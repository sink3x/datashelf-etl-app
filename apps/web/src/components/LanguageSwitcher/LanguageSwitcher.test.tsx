import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StatusBadge } from '@components/StatusBadge/StatusBadge'
import { LANGUAGE_STORAGE_KEY } from '@shared/i18n/i18n.constants'
import { getNativeLanguageName } from '@shared/i18n/i18n.utils'

import { LanguageSwitcher } from './LanguageSwitcher'
import en from '../../shared/i18n/locales/en.json'
import ru from '../../shared/i18n/locales/ru.json'
import { renderWithI18n } from '../../test/render'

describe('LanguageSwitcher', () => {
	it('switches the rendered text, the document language and the stored preference', async () => {
		renderWithI18n(
			<>
				<LanguageSwitcher />
				<StatusBadge state="running" />
			</>,
		)

		expect(screen.getByRole('radiogroup', { name: en.language.switcherLabel })).toBeTruthy()
		expect(screen.getByText(en.runState.running)).toBeTruthy()

		fireEvent.click(screen.getByRole('radio', { name: getNativeLanguageName('ru') }))

		expect(await screen.findByText(ru.runState.running)).toBeTruthy()
		expect(screen.queryByText(en.runState.running)).toBeNull()
		expect(screen.getByRole('radiogroup', { name: ru.language.switcherLabel })).toBeTruthy()
		expect(document.documentElement.lang).toBe('ru')
		expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ru')
	})
})
