import type { TMetricChart } from '@interfaces/chart'
import { formatCompactNumber, formatFullNumber } from '@utils/format-number'

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

const PREFIX_UNIT_SIGNS = new Set(['$', '€', '£', '¥', '₽'])

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

const withUnit = (value: string, unitSign: string | undefined) => {
	const unit = unitSign?.trim()

	if (!unit) {
		return value
	}

	return PREFIX_UNIT_SIGNS.has(unit) ? `${unit}${value}` : `${value} ${unit}`
}

export const formatMetricValue = (chart: TMetricChart) => {
	const { value, unit_sign: unitSign } = chart

	return withUnit(typeof value === 'number' ? formatCompactNumber(value) : value, unitSign)
}

export const formatMetricValueFull = (chart: TMetricChart) => {
	const { value, unit_sign: unitSign } = chart

	return withUnit(typeof value === 'number' ? formatFullNumber(value) : value, unitSign)
}
