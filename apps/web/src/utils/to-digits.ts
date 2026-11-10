export const toDigits = (value: number): string => {
	if (value >= 1_000_000) {
		return Math.round(value / 1_000_000).toFixed(1) + 'm'
	}

	if (value >= 1_000) {
		return Math.round(value / 1_000).toFixed(1) + 'k'
	}

	return String(value)
}
