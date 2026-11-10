import { Result } from 'antd'
import styled from 'styled-components'

export const ResultDashboardError = styled(Result)`
	margin-inline: auto;
`

export const GridContainer = styled.div`
	width: 100%;
	height: 100%;
	margin-bottom: 25px;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	gap: 16px;
	box-sizing: border-box;

	.chart-frequency,
	.chart-grouped {
		grid-column: span 2;
	}
`
