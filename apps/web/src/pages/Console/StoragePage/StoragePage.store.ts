import { makeAutoObservable, runInAction } from 'mobx'

import type { IRawFile } from '@interfaces/file-raw'
import type { TMaybe } from '@interfaces/maybe'
import type { IResponseMeta } from '@interfaces/response-meta'
import { getRawFileList } from '@services/dataset-service/dataset-service'
import { getAxiosError } from '@utils/get-axios-error/get-axios-error'

import { INITIAL_CURRENT_PAGE, INITIAL_CURRENT_PAGE_SIZE } from './StoragePage.constants'

export class StoragePageStore {
	rawFileList: IRawFile[] = []
	rawFileListMeta: IResponseMeta = {}
	isLoading = true
	errorMessage: TMaybe<string> = null

	page = INITIAL_CURRENT_PAGE
	pageSize = INITIAL_CURRENT_PAGE_SIZE

	constructor() {
		makeAutoObservable(this)
	}

	get totalCount() {
		return this.rawFileListMeta.totalCount ?? 0
	}

	get isEmpty() {
		return this.rawFileList.length === 0
	}

	setPagination = (page: number, pageSize: number) => {
		this.page = pageSize === this.pageSize ? page : INITIAL_CURRENT_PAGE
		this.pageSize = pageSize
		void this.fetchRawFileList()
	}

	fetchRawFileList = async () => {
		this.isLoading = true
		this.errorMessage = null

		try {
			const { datasetList, meta } = await getRawFileList({ page: this.page, limit: this.pageSize })

			runInAction(() => {
				this.rawFileList = datasetList ?? []
				this.rawFileListMeta = meta ?? {}
			})
		} catch (error) {
			runInAction(() => {
				this.errorMessage = getAxiosError(error)
			})
		} finally {
			runInAction(() => {
				this.isLoading = false
			})
		}
	}
}
