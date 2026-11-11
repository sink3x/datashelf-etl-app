import { useEffect, useState } from 'react'

import { Spin } from 'antd'
import { observer } from 'mobx-react-lite'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { ERoutesPageNames, Routes } from '@router/routes'
import { Button } from '@ui/Button/Button'

import type { IDatasetProcessed } from '@interfaces/dataset-processed'

import { ChartCard } from './components/ChartCard/ChartCard'
import { MetricCard } from './components/MetricCard/MetricCard'
import { TEMPLATE_VIEW_LIST } from './DashboardPage.constants'
import { DashboardPageStore } from './DashboardPage.store'
import * as Styled from './DashboardPage.styles'

export const DashboardPage = observer(() => {
	const navigate = useNavigate()

	const [dashboardPageStore] = useState(new DashboardPageStore())
	const { charts, fetchChartListByFileName, isLoadingCharts, errorMessageCharts } = dashboardPageStore

	const { filename } = useParams()

	const handleClickNavigateToStorage = () => {
		navigate(Routes[ERoutesPageNames.CONSOLE]!.children!.CONSOLE_FILES!.fullPath!)
	}

	const handleClickRefreshDashboard = () => {
		if (filename) {
			fetchChartListByFileName(filename)
		}
	}

	useEffect(() => {
		if (filename) {
			fetchChartListByFileName(filename)
		}
	}, [fetchChartListByFileName, filename])

	if (!filename) {
		return <Navigate to={Routes[ERoutesPageNames.CONSOLE]!.children!.CONSOLE_FILES!.fullPath!} />
	}

	if (isLoadingCharts) {
		return <Spin size="large" />
	}

	if (errorMessageCharts) {
		return (
			<Styled.ResultDashboardError
				status="error"
				title="Generate dashboard failed"
				subTitle={errorMessageCharts}
				extra={[
					<Button type="primary" key="open-storage" onClick={handleClickNavigateToStorage}>
						Open storage
					</Button>,
					<Button key="refresh" onClick={handleClickRefreshDashboard}>
						Refresh
					</Button>,
				]}
			/>
		)
	}

	return (
		<Styled.GridContainer>
			{TEMPLATE_VIEW_LIST.map((chartObjectName) => {
				const chartFormatted = charts?.[chartObjectName]?.[0] as IDatasetProcessed['chart']

				if (!chartFormatted) {
					return null
				}

				if (chartFormatted.type === 'metric') {
					return (
						<MetricCard
							key={chartFormatted.name}
							chartFormatted={chartFormatted}
							className={`chart-card chart-${chartFormatted.type} metric-card`}
						/>
					)
				}

				return <ChartCard key={chartFormatted.name} chartFormatted={chartFormatted} />
			})}
		</Styled.GridContainer>
	)
})
