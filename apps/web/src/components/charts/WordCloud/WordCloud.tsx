import type { FC } from 'react'

import { theme } from 'antd'
import { scaleOrdinal } from 'd3-scale'
import WordCloudD3 from 'react-d3-cloud'

import type { IWordCloudProps } from './WordCloud.interfaces'

export const WordCloud: FC<IWordCloudProps> = (props) => {
	const { values } = props

	const { token } = theme.useToken()

	const colors = [
		token.colorPrimary,
		token.colorSuccess,
		token.colorWarning,
		token.colorError,
		token.colorInfo,
		token.colorText,
		token.colorBorder,
	]

	const colorScale = scaleOrdinal(colors)

	return (
		<div style={{ width: '100%', height: '100%' }}>
			<WordCloudD3
				data={values}
				width={600}
				height={300}
				font="Inter Variable"
				fontWeight="bold"
				fontSize={(word) => Math.min(60, Math.max(12, word.value * 0.5))}
				spiral="archimedean"
				rotate={0}
				// @ts-ignore
				fill={(_: unknown, word: string) => colorScale(word)}
			/>
		</div>
	)
}
