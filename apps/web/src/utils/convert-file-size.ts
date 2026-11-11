import { formatNumber } from './format-number'

const BYTE_BASE = 1024
const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'] as const

export const convertFileSize = (bytes: number, locale: string, decimals = 2) => {
	const sizeIndex =
		bytes > 0 ? Math.min(Math.floor(Math.log(bytes) / Math.log(BYTE_BASE)), SIZE_UNITS.length - 1) : 0

	return formatNumber(bytes / Math.pow(BYTE_BASE, sizeIndex), locale, {
		style: 'unit',
		unit: SIZE_UNITS[sizeIndex],
		unitDisplay: sizeIndex === 0 ? 'long' : 'short',
		maximumFractionDigits: decimals,
	})
}
