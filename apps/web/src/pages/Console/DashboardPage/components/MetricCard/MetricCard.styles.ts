import { Card, Typography } from 'antd'
import styled from 'styled-components'

export const MetricCardContainer = styled(Card)`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 16px;
	text-align: center;
`

export const CardTitle = styled(Typography.Paragraph)`
	font-size: 14px;
	color: #888;
	margin-bottom: 4px;
`

export const CardValue = styled(Typography.Paragraph)`
	font-size: 24px;
	font-weight: bold;
	color: #333;
`
