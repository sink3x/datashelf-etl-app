export const ALLOWLABLE_FILE_TYPE_LIST = ['text/csv', 'application/json']

export const uploadFormAcceptedFileTypeList = ALLOWLABLE_FILE_TYPE_LIST.map(
	(fileType) => `.${fileType.split('/').at(-1)!}`,
)
export const uploadButtonLabelAcceptedfileList = ALLOWLABLE_FILE_TYPE_LIST.map((fileType) =>
	fileType.split('/').at(-1)!.toUpperCase(),
)
