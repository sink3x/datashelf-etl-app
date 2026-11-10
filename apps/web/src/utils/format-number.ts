const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const fullFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

export const formatCompactNumber = (value: number) => compactFormatter.format(value)

export const formatFullNumber = (value: number) => fullFormatter.format(value)
