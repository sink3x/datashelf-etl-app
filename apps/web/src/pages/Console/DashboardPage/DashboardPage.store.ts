import { makeAutoObservable, runInAction } from 'mobx'

import type { TChartsByName } from '@interfaces/chart'
import type { TMaybe } from '@interfaces/maybe'
import { getCharts } from '@services/dataset-service/dataset-service'
import { getAxiosError } from '@utils/get-axios-error/get-axios-error'

import { buildDashboardLayout } from './DashboardPage.utils'

export class DashboardPageStore {
	charts: TChartsByName = {}
	isLoading = true
	errorMessage: TMaybe<string> = null

	constructor() {
		makeAutoObservable(this)
	}

	get layout() {
		return buildDashboardLayout(this.charts)
	}

	get isEmpty() {
		return this.layout.chartCount === 0
	}

	fetchCharts = async (filename: string) => {
		this.isLoading = true
		this.errorMessage = null

		try {
			const { charts } = await getCharts(filename)

			runInAction(() => {
				this.charts = charts ?? {}
			})
		} catch (error) {
			runInAction(() => {
				this.charts = {}
				this.errorMessage = getAxiosError(error)
			})
		} finally {
			runInAction(() => {
				this.isLoading = false
			})
		}
	}
}
