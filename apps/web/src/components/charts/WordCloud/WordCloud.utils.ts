export const adapterWordCloudValueList = (valueList: number[], labelList: string[]) => {
	return valueList.map((valueNumber, index) => ({
		value: valueNumber,
		text: labelList[index]!,
	}))
}
