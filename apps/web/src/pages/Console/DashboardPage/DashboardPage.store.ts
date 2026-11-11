import { makeAutoObservable, observable, runInAction } from 'mobx'

import type { TChartsByName } from '@interfaces/chart'
import { getCharts } from '@services/dataset-service/dataset-service'

import { buildDashboardLayout } from './DashboardPage.utils'

export class DashboardPageStore {
	charts: TChartsByName = {}
	isLoading = true
	error: unknown = null

	constructor() {
		makeAutoObservable(this, { error: observable.ref })
	}

	get layout() {
		return buildDashboardLayout(this.charts)
	}

	get isEmpty() {
		return this.layout.chartCount === 0
	}

	fetchCharts = async (filename: string) => {
		this.isLoading = true
		this.error = null

		try {
			const { charts } = await getCharts(filename)

			runInAction(() => {
				this.charts = charts ?? {}
			})
		} catch (error) {
			runInAction(() => {
				this.charts = {}
				this.error = error
			})
		} finally {
			runInAction(() => {
				this.isLoading = false
			})
		}
	}
}
