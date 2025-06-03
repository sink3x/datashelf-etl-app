import { makeAutoObservable } from 'mobx'
import { toast } from 'react-toastify'

import type { IRawFile } from '@interfaces/file-raw'
import type { TMaybe } from '@interfaces/maybe'
import type { IResponseMeta } from '@interfaces/response-meta'
import { getRawFileList } from '@services/dataset-service/dataset-service'
import { getAxiosError } from '@utils/get-axios-error/get-axios-error'

import { INITIAL_CURRENT_PAGE, INITIAL_CURRENT_PAGE_SIZE } from './StoragePage.constants'

import type { IFetchRawFileListParams } from './StoragePage.interfaces'

export class StoragePageStore {
	rawFileList: IRawFile[] = []
	rawFileListMeta: IResponseMeta = {}
	isLoadingRawFileList = true
	errorMessageRawFileList: TMaybe<string> = null

	page = INITIAL_CURRENT_PAGE
	pageSize = INITIAL_CURRENT_PAGE_SIZE

	constructor() {
		makeAutoObservable(this)

		this.fetchRawFileList()
	}

	reset = () => {
		this.setPage(INITIAL_CURRENT_PAGE)
		this.setPageSize(INITIAL_CURRENT_PAGE_SIZE)
	}

	setRawFileListMeta = (newMeta: IResponseMeta) => {
		this.rawFileListMeta = newMeta
	}

	setRawFileList = (newFileList: IRawFile[]) => {
		this.rawFileList = newFileList
	}

	setIsLoadingRawFileList = (flag: boolean) => {
		this.isLoadingRawFileList = flag
	}

	setErrorMessageRawFileList = (errorMessage: string) => {
		this.errorMessageRawFileList = errorMessage
	}

	setPage = (newPage: number) => {
		this.page = newPage
	}

	setPageSize = (newPageSize: number) => {
		this.pageSize = newPageSize
	}

	fetchRawFileList = async (params?: IFetchRawFileListParams) => {
		const { isUpdateIsLoading = true } = params || {}

		if (isUpdateIsLoading) {
			this.setIsLoadingRawFileList(true)
		}

		try {
			const { data } = await getRawFileList({
				page: this.page,
				limit: this.pageSize,
			})
			const { datasetList, meta } = data

			if (meta) {
				this.setRawFileListMeta(meta)
			}

			if (datasetList) {
				this.setRawFileList(datasetList)
			}
		} catch (error) {
			const errorMessage = getAxiosError(error)

			if (errorMessage) {
				this.setErrorMessageRawFileList(errorMessage)

				toast(errorMessage, {
					type: 'error',
				})
			}
		}

		if (isUpdateIsLoading) {
			this.setIsLoadingRawFileList(false)
		}
	}

	get totalCount() {
		const { totalCount = 0 } = this.rawFileListMeta
		return totalCount
	}

	get totalPages() {
		const { totalPages = 1 } = this.rawFileListMeta
		return totalPages
	}

	get isRawFileListEmpty() {
		return this.rawFileList.length === 0
	}
}
