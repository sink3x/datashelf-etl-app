import styled from 'styled-components'

import { Button } from '@ui/Button/Button'

import { colors, fontSizes, media, radii, space } from '@styles/tokens'

export const Card = styled.article<{ $isWide: boolean }>`
	min-width: 0;
	padding: ${space(5)};
	display: flex;
	flex-direction: column;
	gap: ${space(4)};
	grid-column: ${({ $isWide }) => ($isWide ? 'span 2' : 'span 1')};
	border: 1px solid ${colors.line};
	border-radius: ${radii.lg};
	background: ${colors.surface};

	${media.belowLg} {
		grid-column: span 1;
	}

	${media.belowSm} {
		padding: ${space(4)};
	}
`

export const Header = styled.header`
	display: flex;
	gap: ${space(3)};
	align-items: flex-start;
	justify-content: space-between;
`

export const Title = styled.h3`
	margin: 0;
	color: ${colors.ink};
	font-size: ${fontSizes.lg};
	font-weight: 600;
	line-height: 1.4;
`

export const Description = styled.p`
	margin: ${space(1)} 0 0;
	max-width: 70ch;
	color: ${colors.inkMuted};
	font-size: ${fontSizes.sm};
	line-height: 1.5;
`

export const DownloadButton = styled(Button)`
	flex: none;
	color: ${colors.inkMuted};
`

export const Body = styled.div`
	min-width: 0;
	min-height: 300px;
`
