import { useMemo, type FC } from 'react'

import WordCloudD3 from 'react-d3-cloud'

import { chartPalette, fonts } from '@styles/tokens'

import * as Styled from './WordCloud.styles'

import type { IWordCloudProps } from './WordCloud.interfaces'

const MIN_FONT_SIZE = 14
const MAX_FONT_SIZE = 56
const CLOUD_WIDTH = 640
const CLOUD_HEIGHT = 300

export const WordCloud: FC<IWordCloudProps> = (props) => {
	const { values } = props

	const maxValue = useMemo(() => Math.max(1, ...values.map(({ value }) => value)), [values])
	const colorByWord = useMemo(
		() => new Map(values.map(({ text }, index) => [text, chartPalette[index % chartPalette.length]!])),
		[values],
	)

	return (
		<Styled.CloudContainer>
			<WordCloudD3
				data={values}
				width={CLOUD_WIDTH}
				height={CLOUD_HEIGHT}
				font={fonts.sans}
				fontWeight={600}
				fontSize={(word) =>
					MIN_FONT_SIZE + Math.sqrt(word.value / maxValue) * (MAX_FONT_SIZE - MIN_FONT_SIZE)
				}
				spiral="archimedean"
				rotate={0}
				padding={3}
				fill={(word: { text: string }) => colorByWord.get(word.text) ?? chartPalette[0]}
			/>
		</Styled.CloudContainer>
	)
}
