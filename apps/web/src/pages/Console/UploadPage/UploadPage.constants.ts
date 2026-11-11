export const ALLOWED_FILE_EXTENSIONS = ['.csv', '.json']
export const ALLOWED_MIME_TYPES = ['text/csv', 'application/json']
export const RUN_POLL_INTERVAL_MS = 3000

export const isAllowedFile = (file: Pick<File, 'name' | 'type'>) => {
	const extension = `.${file.name.split('.').at(-1)?.toLowerCase() ?? ''}`

	return ALLOWED_MIME_TYPES.includes(file.type) || ALLOWED_FILE_EXTENSIONS.includes(extension)
}
