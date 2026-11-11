const formatterCache = new Map<string, Intl.NumberFormat>()

const getNumberFormat = (locale: string, options: Intl.NumberFormatOptions) => {
	const cacheKey = `${locale}:${JSON.stringify(options)}`
	let formatter = formatterCache.get(cacheKey)

	if (!formatter) {
		formatter = new Intl.NumberFormat(locale, options)
		formatterCache.set(cacheKey, formatter)
	}

	return formatter
}

export const COMPACT_NUMBER_OPTIONS: Intl.NumberFormatOptions = {
	notation: 'compact',
	minimumFractionDigits: 0,
	maximumFractionDigits: 1,
}

export const FULL_NUMBER_OPTIONS: Intl.NumberFormatOptions = {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
}

export const formatNumber = (value: number, locale: string, options: Intl.NumberFormatOptions = {}) =>
	getNumberFormat(locale, options).format(value)

export const formatCompactNumber = (value: number, locale: string) =>
	formatNumber(value, locale, COMPACT_NUMBER_OPTIONS)

export const formatFullNumber = (value: number, locale: string) =>
	formatNumber(value, locale, FULL_NUMBER_OPTIONS)

export const formatPercent = (ratio: number, locale: string) =>
	formatNumber(ratio, locale, { style: 'percent', maximumFractionDigits: 0 })
