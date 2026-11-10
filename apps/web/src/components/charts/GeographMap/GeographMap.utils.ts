import { scaleQuantize } from 'd3-scale'

export const getColorList = (maxSale: number) =>
	scaleQuantize<string>()
		.domain([0, maxSale])
		.range([
			'#e6f7ff',
			'#bae7ff',
			'#91d5ff',
			'#69c0ff',
			'#40a9ff',
			'#1890ff',
			'#096dd9',
			'#0050b3',
			'#003a8c',
		])

export const adapterGeographMapValuesList = (valueList: number[], labelList: string[]) => {
	return valueList.map((valueNumber, index) => ({
		saleSum: Number(valueNumber.toFixed(0)),
		city: labelList[index]!,
	}))
}
