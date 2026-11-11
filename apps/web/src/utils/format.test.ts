import { describe, expect, it } from 'vitest'

import { convertFileSize } from './convert-file-size'
import { formatDateTime } from './format-date'
import { formatCompactNumber, formatFullNumber, formatPercent } from './format-number'

const ISO_DATE = '2025-06-01T10:15:00Z'

describe('locale-aware formatting', () => {
	it('formats numbers for the given locale', () => {
		expect(formatCompactNumber(52_341.17, 'en-US')).toBe('52.3K')
		expect(formatFullNumber(1_284_530.424, 'en-US')).toBe('1,284,530.42')
		expect(formatFullNumber(1_284_530.424, 'ru-RU')).toBe('1 284 530,42')
		expect(formatPercent(0.456, 'en-US')).toBe('46%')
		expect(formatPercent(0.456, 'ru-RU')).toBe('46 %')
	})

	it('formats file sizes with binary steps and localized units', () => {
		expect(convertFileSize(0, 'en-US')).toBe('0 bytes')
		expect(convertFileSize(512, 'en-US')).toBe('512 bytes')
		expect(convertFileSize(1536, 'en-US')).toBe('1.5 kB')
		expect(convertFileSize(5 * 1024 * 1024, 'en-US')).toBe('5 MB')
		expect(convertFileSize(1536, 'ru-RU')).toMatch(/^1,5\s/)
	})

	it('formats dates for the given locale and keeps invalid input', () => {
		expect(formatDateTime(ISO_DATE, 'en-US')).toMatch(/Jun 1, 2025/)
		expect(formatDateTime(ISO_DATE, 'ru-RU')).not.toBe(formatDateTime(ISO_DATE, 'en-US'))
		expect(formatDateTime('not a date', 'en-US')).toBe('not a date')
	})
})
