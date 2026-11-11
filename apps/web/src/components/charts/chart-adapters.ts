import type { TMetricChart } from '@interfaces/chart'
import { COMPACT_NUMBER_OPTIONS, formatNumber, FULL_NUMBER_OPTIONS } from '@utils/format-number'

export interface ILabelValue {
	label: string
	value: number
}

export interface IWordCloudDatum {
	text: string
	value: number
}

export interface ICitySales {
	city: string
	saleSum: number
}

const CURRENCY_BY_UNIT_SIGN: Record<string, string> = {
	$: 'USD',
	'€': 'EUR',
	'£': 'GBP',
	'¥': 'JPY',
	'₽': 'RUB',
}

const zip = (labels: readonly string[], values: readonly number[]): ILabelValue[] => {
	const length = Math.min(labels.length, values.length)

	return Array.from({ length }, (_, index) => ({ label: labels[index]!, value: values[index]! })).filter(
		({ value }) => Number.isFinite(value),
	)
}

export const toLabelValueList = (labels: readonly string[], values: readonly number[]) => zip(labels, values)

export const toWordCloudList = (labels: readonly string[], values: readonly number[]): IWordCloudDatum[] =>
	zip(labels, values).map(({ label, value }) => ({ text: label, value }))

export const toCitySalesList = (labels: readonly string[], valuesSum: readonly number[]): ICitySales[] =>
	zip(labels, valuesSum).map(({ label, value }) => ({ city: label, saleSum: Math.round(value) }))

const formatWithUnit = (
	value: number | string,
	unitSign: string | undefined,
	locale: string,
	options: Intl.NumberFormatOptions,
) => {
	const unit = unitSign?.trim()
	const currency = unit ? CURRENCY_BY_UNIT_SIGN[unit] : undefined

	if (typeof value === 'number' && currency) {
		return formatNumber(value, locale, {
			...options,
			style: 'currency',
			currency,
			currencyDisplay: 'narrowSymbol',
		})
	}

	const formatted = typeof value === 'number' ? formatNumber(value, locale, options) : value

	if (!unit) {
		return formatted
	}

	return currency ? `${unit}${formatted}` : `${formatted} ${unit}`
}

export const formatMetricValue = (chart: TMetricChart, locale: string) =>
	formatWithUnit(chart.value, chart.unit_sign, locale, COMPACT_NUMBER_OPTIONS)

export const formatMetricValueFull = (chart: TMetricChart, locale: string) =>
	formatWithUnit(chart.value, chart.unit_sign, locale, FULL_NUMBER_OPTIONS)
