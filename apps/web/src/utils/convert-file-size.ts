export const convertFileSize = (bytes: number, decimals = 2) => {
	if (bytes === 0) {
		return '0 B'
	}

	const digit = 1024
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']
	const sizeIndex = Math.floor(Math.log(bytes) / Math.log(digit))

	const value = bytes / Math.pow(digit, sizeIndex)

	return `${parseFloat(value.toFixed(decimals))} ${sizes[sizeIndex]}`
}
