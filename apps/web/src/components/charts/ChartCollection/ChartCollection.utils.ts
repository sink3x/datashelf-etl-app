export const adapterBaseChartValueList = (values: number[], labels: string[]) => {
	return values.map((valueNumber, index) => ({
		value: valueNumber,
		type: labels[index]!,
	}))
}
