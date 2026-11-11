import { useRef, useState, type FC } from 'react'

import { ArrowDownToLine } from '@gravity-ui/icons'
import { Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

import { ChartCollection } from '@components/charts/ChartCollection/ChartCollection'
import { colors } from '@styles/tokens'

import * as Styled from './ChartCard.styles'

import type { IChartCardProps } from './ChartCard.interfaces'

export const ChartCard: FC<IChartCardProps> = (props) => {
	const { chart, isWide = false } = props

	const { t } = useTranslation()

	const chartRef = useRef<HTMLDivElement>(null)
	const [isExporting, setIsExporting] = useState(false)

	const titleId = `chart-title-${chart.name}`

	const handleDownload = async () => {
		if (!chartRef.current) {
			return
		}

		setIsExporting(true)

		try {
			const { default: html2canvas } = await import('html2canvas')
			const canvas = await html2canvas(chartRef.current, { backgroundColor: colors.surface, scale: 2 })
			const link = document.createElement('a')

			link.href = canvas.toDataURL('image/png')
			link.download = `${chart.name}.png`
			link.click()
		} finally {
			setIsExporting(false)
		}
	}

	return (
		<Styled.Card aria-labelledby={titleId} $isWide={isWide} data-testid={`chart-${chart.name}`}>
			<Styled.Header>
				<div>
					<Styled.Title id={titleId}>{chart.title}</Styled.Title>
					{chart.description && <Styled.Description>{chart.description}</Styled.Description>}
				</div>
				<Tooltip title={t('dashboard.downloadTooltip')}>
					<Styled.DownloadButton
						type="text"
						aria-label={t('dashboard.downloadChart', { title: chart.title })}
						icon={<ArrowDownToLine aria-hidden />}
						loading={isExporting}
						onClick={handleDownload}
					/>
				</Tooltip>
			</Styled.Header>
			<Styled.Body ref={chartRef}>
				<ChartCollection chart={chart} />
			</Styled.Body>
		</Styled.Card>
	)
}
