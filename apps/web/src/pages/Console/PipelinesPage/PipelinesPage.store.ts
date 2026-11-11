import { makeAutoObservable, observable, runInAction } from 'mobx'

import type { IDag } from '@interfaces/dag'
import { getDagList } from '@services/airflow-service/airflow-service'

export class PipelinesPageStore {
	dagList: IDag[] = []
	isLoading = true
	error: unknown = null

	constructor() {
		makeAutoObservable(this, { error: observable.ref })
	}

	fetchDagList = async () => {
		this.isLoading = true
		this.error = null

		try {
			const { dags } = await getDagList()

			runInAction(() => {
				this.dagList = Array.isArray(dags) ? dags : []
			})
		} catch (error) {
			runInAction(() => {
				this.error = error
			})
		} finally {
			runInAction(() => {
				this.isLoading = false
			})
		}
	}
}
