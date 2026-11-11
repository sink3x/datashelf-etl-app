import { useEffect, useState } from 'react'

import { ArrowRotateRight, ChartColumn, TriangleExclamation } from '@gravity-ui/icons'
import { observer } from 'mobx-react-lite'
import { Navigate, useParams } from 'react-router-dom'

import { ROUTE_PATHS } from '@router/paths'
import { Button } from '@ui/Button/Button'
import { ButtonLink } from '@ui/ButtonLink/ButtonLink'

import { PageState } from '@components/PageState/PageState'

import { ChartCard } from './components/ChartCard/ChartCard'
import { MetricCard } from './components/MetricCard/MetricCard'
import { WIDE_CHART_TYPES } from './DashboardPage.constants'
import { DashboardPageStore } from './DashboardPage.store'
import * as Styled from './DashboardPage.styles'

const STORAGE_PATH = ROUTE_PATHS.CONSOLE_FILES
const UPLOAD_PATH = ROUTE_PATHS.CONSOLE_UPLOAD

const DashboardSkeleton = () => (
	<Styled.Page aria-busy="true" aria-label="Loading dashboard">
		<Styled.MetricStrip>
			{Array.from({ length: 4 }, (_, index) => (
				<Styled.SkeletonBlock key={index} $height={88} />
			))}
		</Styled.MetricStrip>
		<Styled.ChartGrid>
			<Styled.SkeletonBlock $height={360} $isWide />
			<Styled.SkeletonBlock $height={360} />
			<Styled.SkeletonBlock $height={360} />
		</Styled.ChartGrid>
	</Styled.Page>
)

export const DashboardPage = observer(() => {
	const { filename } = useParams()
	const [store] = useState(() => new DashboardPageStore())

	const { fetchCharts, isLoading, errorMessage, isEmpty, layout } = store

	useEffect(() => {
		if (filename) {
			void fetchCharts(filename)
		}
	}, [fetchCharts, filename])

	if (!filename) {
		return <Navigate to={STORAGE_PATH} replace />
	}

	const handleRefresh = () => {
		void fetchCharts(filename)
	}

	const refreshButton = (
		<Button icon={<ArrowRotateRight aria-hidden />} onClick={handleRefresh} loading={isLoading && !isEmpty}>
			Refresh
		</Button>
	)

	const renderContent = () => {
		if (isLoading && isEmpty) {
			return <DashboardSkeleton />
		}

		if (errorMessage) {
			return (
				<PageState
					tone="error"
					icon={<TriangleExclamation />}
					title="Couldn’t load the dashboard"
					description={errorMessage}
					actions={
						<>
							<Button type="primary" onClick={handleRefresh}>
								Try again
							</Button>
							<ButtonLink to={STORAGE_PATH}>Back to storage</ButtonLink>
						</>
					}
				/>
			)
		}

		if (isEmpty) {
			return (
				<PageState
					icon={<ChartColumn />}
					title="No charts for this file yet"
					description="The pipeline publishes charts as each analysis step finishes, usually within a minute of the upload. Refresh to check again, or upload the file again if the run failed."
					actions={
						<>
							<Button type="primary" onClick={handleRefresh}>
								Refresh
							</Button>
							<ButtonLink to={UPLOAD_PATH}>Upload a dataset</ButtonLink>
						</>
					}
				/>
			)
		}

		return (
			<Styled.Page>
				{layout.metrics.length > 0 && (
					<Styled.MetricStrip aria-label="Key metrics">
						{layout.metrics.map((chart) => (
							<MetricCard key={chart.name} chart={chart} />
						))}
					</Styled.MetricStrip>
				)}
				{layout.sections.map((section) => (
					<Styled.Section key={section.id} aria-labelledby={`section-${section.id}`}>
						<Styled.SectionHeader>
							<Styled.SectionTitle id={`section-${section.id}`}>{section.title}</Styled.SectionTitle>
							<Styled.SectionDescription>{section.description}</Styled.SectionDescription>
						</Styled.SectionHeader>
						<Styled.ChartGrid>
							{section.charts.map((chart) => (
								<ChartCard key={chart.name} chart={chart} isWide={WIDE_CHART_TYPES.has(chart.type)} />
							))}
						</Styled.ChartGrid>
					</Styled.Section>
				))}
			</Styled.Page>
		)
	}

	return (
		<>
			<Styled.Toolbar>
				<Styled.FileInfo>
					<Styled.FileName title={filename}>{filename}</Styled.FileName>
					{!isLoading && !errorMessage && !isEmpty && (
						<Styled.FileMeta>
							{layout.chartCount} {layout.chartCount === 1 ? 'chart' : 'charts'}
						</Styled.FileMeta>
					)}
				</Styled.FileInfo>
				{refreshButton}
			</Styled.Toolbar>
			{renderContent()}
		</>
	)
})
