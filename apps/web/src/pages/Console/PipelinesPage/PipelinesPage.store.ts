import { makeAutoObservable, runInAction } from 'mobx'

import type { IDag } from '@interfaces/dag'
import type { TMaybe } from '@interfaces/maybe'
import { getDagList } from '@services/airflow-service/airflow-service'
import { getAxiosError } from '@utils/get-axios-error/get-axios-error'

export class PipelinesPageStore {
	dagList: IDag[] = []
	isLoading = true
	errorMessage: TMaybe<string> = null

	constructor() {
		makeAutoObservable(this)
	}

	fetchDagList = async () => {
		this.isLoading = true
		this.errorMessage = null

		try {
			const { dags } = await getDagList()

			runInAction(() => {
				this.dagList = Array.isArray(dags) ? dags : []
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
