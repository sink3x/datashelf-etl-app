import { describe, expect, it } from 'vitest'

import type { TMetricChart } from '@interfaces/chart'

import {
	formatMetricValue,
	formatMetricValueFull,
	toCitySalesList,
	toLabelValueList,
	toWordCloudList,
} from './chart-adapters'

const EN = 'en-US'
const RU = 'ru-RU'

const metric = (overrides: Partial<TMetricChart>): TMetricChart => ({
	name: 'total_sales',
	title: 'Total Sales',
	description: 'Total revenue from all sales.',
	type: 'metric',
	value: 0,
	...overrides,
})

describe('series adapters', () => {
	it('pairs labels with values and ignores unmatched tails', () => {
		expect(toLabelValueList(['a', 'b', 'c'], [1, 2])).toEqual([
			{ label: 'a', value: 1 },
			{ label: 'b', value: 2 },
		])
	})

	it('drops non-finite values', () => {
		expect(toLabelValueList(['a', 'b'], [Number.NaN, 3])).toEqual([{ label: 'b', value: 3 }])
	})

	it('maps frequency data to word cloud entries', () => {
		expect(toWordCloudList(['Boston'], [12])).toEqual([{ text: 'Boston', value: 12 }])
	})

	it('rounds grouped sales per city', () => {
		expect(toCitySalesList(['Boston', 'Chicago'], [500.25, 320.6])).toEqual([
			{ city: 'Boston', saleSum: 500 },
			{ city: 'Chicago', saleSum: 321 },
		])
	})
})

describe('formatMetricValue', () => {
	it('shortens large numbers and prefixes currency signs', () => {
		expect(formatMetricValue(metric({ value: 1_284_530.42, unit_sign: '$' }), EN)).toBe('$1.3M')
		expect(formatMetricValue(metric({ value: 52_341.17, unit_sign: '$' }), EN)).toBe('$52.3K')
	})

	it('keeps small numbers readable without a unit', () => {
		expect(formatMetricValue(metric({ value: 5.49, unit_sign: '' }), EN)).toBe('5.5')
		expect(formatMetricValue(metric({ value: 24 }), EN)).toBe('24')
	})

	it('suffixes non-currency units', () => {
		expect(formatMetricValue(metric({ value: 42, unit_sign: 'items' }), EN)).toBe('42 items')
	})

	it('passes string values through', () => {
		expect(formatMetricValue(metric({ value: '2023-12' }), EN)).toBe('2023-12')
	})

	it('formats the full value for tooltips', () => {
		expect(formatMetricValueFull(metric({ value: 1_284_530.424, unit_sign: '$' }), EN)).toBe('$1,284,530.42')
	})

	it('follows the russian number and currency conventions', () => {
		expect(formatMetricValueFull(metric({ value: 1_284_530.424, unit_sign: '$' }), RU)).toBe(
			'1\u00a0284\u00a0530,42\u00a0$',
		)
		expect(formatMetricValue(metric({ value: 5.49, unit_sign: '' }), RU)).toBe('5,5')
		expect(formatMetricValue(metric({ value: 42, unit_sign: 'items' }), RU)).toBe('42 items')
	})
})
