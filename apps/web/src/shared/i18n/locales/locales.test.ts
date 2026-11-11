import { describe, expect, it } from 'vitest'

import { INTL_LOCALES, SUPPORTED_LANGUAGES, type TLanguage } from '../i18n.constants'

import en from './en.json'
import ru from './ru.json'

const LOCALES: Record<TLanguage, Record<string, unknown>> = { en, ru }

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/

const flatten = (tree: Record<string, unknown>, prefix = ''): Array<[string, string]> =>
	Object.entries(tree).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key

		return typeof value === 'object' && value !== null
			? flatten(value as Record<string, unknown>, path)
			: [[path, String(value)] as [string, string]]
	})

const getBaseKeys = (language: TLanguage) =>
	new Set(flatten(LOCALES[language]).map(([key]) => key.replace(PLURAL_SUFFIX, '')))

const getPlaceholders = (value: string) =>
	[...value.matchAll(/{{\s*(\w+)\s*}}|<(\w+)>/g)].map(([match]) => match).sort()

describe('locale resources', () => {
	it.each(SUPPORTED_LANGUAGES)('%s has the same keys as en, ignoring plural suffixes', (language) => {
		expect([...getBaseKeys(language)].sort()).toEqual([...getBaseKeys('en')].sort())
	})

	it.each(SUPPORTED_LANGUAGES)('%s defines every plural category of its locale', (language) => {
		const keys = flatten(LOCALES[language]).map(([key]) => key)
		const pluralBases = new Set(
			keys.filter((key) => PLURAL_SUFFIX.test(key)).map((key) => key.replace(PLURAL_SUFFIX, '')),
		)
		const categories = new Intl.PluralRules(INTL_LOCALES[language]).resolvedOptions().pluralCategories

		pluralBases.forEach((base) => {
			expect(keys.filter((key) => key.startsWith(`${base}_`)).sort()).toEqual(
				categories.map((category) => `${base}_${category}`).sort(),
			)
		})
	})

	it.each(SUPPORTED_LANGUAGES)('%s has no empty values and keeps the en placeholders', (language) => {
		const enValues = new Map(flatten(en).map(([key, value]) => [key.replace(PLURAL_SUFFIX, ''), value]))

		flatten(LOCALES[language]).forEach(([key, value]) => {
			expect(value.trim(), key).not.toBe('')
			expect(getPlaceholders(value), key).toEqual(
				getPlaceholders(enValues.get(key.replace(PLURAL_SUFFIX, ''))!),
			)
		})
	})
})
