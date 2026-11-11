import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MetricCard } from './MetricCard'
import { renderWithI18n } from '../../../../../test/render'

describe('MetricCard', () => {
	it('shows the title and a compact value with an accessible full value', () => {
		renderWithI18n(
			<MetricCard
				chart={{
					name: 'total_sales',
					title: 'Total Sales',
					description: 'Total revenue from all sales.',
					type: 'metric',
					value: 52341.17,
					unit_sign: '$',
				}}
			/>,
		)

		expect(screen.getByText('Total Sales')).toBeTruthy()
		expect(screen.getByText('$52.3K')).toBeTruthy()
		expect(screen.getByLabelText('Total Sales: $52,341.17')).toBeTruthy()
	})

	it('renders string metrics without a unit', () => {
		renderWithI18n(
			<MetricCard
				chart={{
					name: 'best_month',
					title: 'Best Month for Sales',
					description: '',
					type: 'metric',
					value: '2023-12',
				}}
			/>,
		)

		expect(screen.getByText('2023-12')).toBeTruthy()
		expect(screen.queryByText(/undefined/)).toBeNull()
	})
})
