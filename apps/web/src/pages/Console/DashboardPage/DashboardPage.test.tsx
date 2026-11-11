import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { i18n } from '@shared/i18n/i18n'

import { DashboardPage } from './DashboardPage'
import { mockServer } from '../../../mocks/node'
import ru from '../../../shared/i18n/locales/ru.json'
import { renderWithI18n } from '../../../test/render'

vi.mock('@components/charts/ChartCollection/ChartCollection', () => ({
	ChartCollection: ({ chart }: { chart: { type: string } }) => (
		<div data-testid="chart-body">{chart.type}</div>
	),
}))

const SEEDED_FILE = 'retail-transactions-2023-1748772900.csv'

const renderDashboard = (filename: string) => {
	const router = createMemoryRouter(
		[
			{ path: '/console/dashboard/:filename', element: <DashboardPage /> },
			{ path: '/console/storage', element: <p>Storage page</p> },
		],
		{ initialEntries: [`/console/dashboard/${encodeURIComponent(filename)}`] },
	)

	return renderWithI18n(<RouterProvider router={router} />)
}

describe('DashboardPage', () => {
	it('uses russian plural rules for the chart count', async () => {
		await i18n.changeLanguage('ru')

		renderDashboard(SEEDED_FILE)

		expect(await screen.findByText(ru.dashboard.chartCount_one.replace('{{count}}', '21'))).toBeTruthy()
		expect(screen.getByRole('heading', { name: ru.dashboard.sections.sales.title })).toBeTruthy()
	})

	it('renders metrics and chart sections from the charts endpoint', async () => {
		renderDashboard(SEEDED_FILE)

		const metricStrip = await screen.findByLabelText('Key metrics')

		expect(within(metricStrip).getByText('Total Sales')).toBeTruthy()
		expect(within(metricStrip).getByText('Best Month for Sales')).toBeTruthy()

		expect(screen.getByRole('heading', { name: 'Sales' })).toBeTruthy()
		expect(screen.getByRole('heading', { name: 'Customers' })).toBeTruthy()
		expect(screen.getByRole('heading', { name: 'Seasonal products' })).toBeTruthy()
		expect(screen.getByText('21 charts')).toBeTruthy()

		expect(screen.getByRole('article', { name: 'Monthly Sales Trend' })).toBeTruthy()
		expect(screen.queryByRole('article', { name: 'Total Sales by Month' })).toBeNull()
		expect(screen.getAllByTestId('chart-body')).toHaveLength(13)
	})

	it('explains that a file without charts has not been processed yet', async () => {
		renderDashboard('not-processed.csv')

		expect(await screen.findByText('No charts for this file yet')).toBeTruthy()
		expect(screen.getByRole('link', { name: 'Upload a dataset' })).toBeTruthy()
	})

	it('shows the api error and lets the user retry', async () => {
		mockServer.use(
			http.get('*/api/dataset/charts/:filename', () =>
				HttpResponse.json({ message: 'Failed to get charts' }, { status: 500 }),
			),
		)

		renderDashboard(SEEDED_FILE)

		const alert = await screen.findByRole('alert')

		expect(within(alert).getByText('Couldn’t load the dashboard')).toBeTruthy()
		expect(within(alert).getByText('Failed to get charts')).toBeTruthy()
		expect(within(alert).getByRole('button', { name: 'Try again' })).toBeTruthy()
	})
})
