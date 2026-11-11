import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ChartCard } from './ChartCard'
import { renderWithI18n } from '../../../../../test/render'

vi.mock('@components/charts/ChartCollection/ChartCollection', () => ({
	ChartCollection: ({ chart }: { chart: { type: string; name: string } }) => (
		<div data-testid="chart-body">{`${chart.type}:${chart.name}`}</div>
	),
}))

describe('ChartCard', () => {
	it('labels the card with the chart title and renders the chart body', () => {
		renderWithI18n(
			<ChartCard
				chart={{
					name: 'sales_by_city',
					title: 'Sales by City',
					description: 'Total sales per city.',
					type: 'bar',
					labels: ['Boston'],
					values: [10],
				}}
			/>,
		)

		expect(screen.getByRole('article', { name: 'Sales by City' })).toBeTruthy()
		expect(screen.getByText('Total sales per city.')).toBeTruthy()
		expect(screen.getByTestId('chart-body').textContent).toBe('bar:sales_by_city')
		expect(screen.getByRole('button', { name: 'Download Sales by City as PNG' })).toBeTruthy()
	})
})
