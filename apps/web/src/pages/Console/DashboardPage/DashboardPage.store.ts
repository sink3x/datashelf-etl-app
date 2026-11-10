import { makeAutoObservable } from 'mobx'
import { toast } from 'react-toastify'

import type { IDatasetProcessed } from '@interfaces/dataset-processed'
import type { TMaybe } from '@interfaces/maybe'
import { getCharts } from '@services/dataset-service/dataset-service'
import { getAxiosError } from '@utils/get-axios-error/get-axios-error'

import { AXIOS_ERROR_MESSAGE } from './DashboardPage.constants'

import type { ICharts } from './DashboardPage.interfaces'

export class DashboardPageStore {
	charts: ICharts = {}
	isLoadingCharts = true
	errorMessageCharts: TMaybe<string> = null

	constructor() {
		makeAutoObservable(this)
	}

	setCharts = (charts: ICharts) => {
		this.charts = charts
	}

	setIsLoadingCharts = (flag: boolean) => {
		this.isLoadingCharts = flag
	}

	setErrorMessageCharts = (errorMessage: string) => {
		this.errorMessageCharts = errorMessage
	}

	fetchChartListByFileName = async (fileName: string) => {
		this.setIsLoadingCharts(true)

		try {
			const { data } = await getCharts({ fileName })
			const { charts } = data

			if (charts && Object.keys(charts).length) {
				this.setCharts(charts)
			} else {
				throw new Error('Failed to generate charts')
			}
		} catch (error) {
			let errorMessage = getAxiosError(error)

			const vanilaErrorMessage = (error as Error)!.message

			if (vanilaErrorMessage !== AXIOS_ERROR_MESSAGE) {
				errorMessage = vanilaErrorMessage
			}

			this.setErrorMessageCharts(errorMessage)

			toast(errorMessage, {
				type: 'error',
			})
		}

		this.setIsLoadingCharts(false)
	}

	get chartsFormatted() {
		return Object.values(this.charts).map((chart) => chart[0]) as IDatasetProcessed['chart'][]
	}
}
