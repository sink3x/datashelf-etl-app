import { useRef, type FC } from 'react'

import { FloppyDisk } from '@gravity-ui/icons'
import { Card } from 'antd'
import html2canvas from 'html2canvas'

import { ChartCollection } from '@components/charts/ChartCollection/ChartCollection'
import { EColorsMain } from '@styles/colors/colors-main'

import * as Styled from './ChartCard.styles'

import type { IChartCardProps } from './ChartCard.interfaces'

export const ChartCard: FC<IChartCardProps> = (props) => {
	const { chartFormatted } = props

	const chartRef = useRef(null)

	const handleDownload = async () => {
		if (!chartRef.current) return

		const canvas = await html2canvas(chartRef.current, {
			backgroundColor: EColorsMain.WHITE,
			scale: 2,
		})

		const dataURL = canvas.toDataURL('image/jpeg', 1.0)
		const link = document.createElement('a')

		link.href = dataURL
		link.download = `${chartFormatted.name}.jpg`
		link.click()
	}

	return (
		<Card key={chartFormatted.name} className={`chart-card chart-${chartFormatted.type}`}>
			<Styled.CardTitle>
				{chartFormatted.title}
				<Styled.CardTitleSaveButton type="text" onClick={handleDownload}>
					<FloppyDisk width={25} height={25} />
				</Styled.CardTitleSaveButton>
			</Styled.CardTitle>
			<div ref={chartRef}>
				<ChartCollection data={chartFormatted} values={chartFormatted.values} type={chartFormatted.type} />
			</div>
		</Card>
	)
}
