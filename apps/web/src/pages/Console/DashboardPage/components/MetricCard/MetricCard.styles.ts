import styled from 'styled-components'

import { colors, focusRing, fontSizes, radii, space } from '@styles/tokens'

export const MetricCardContainer = styled.div`
	min-width: 0;
	padding: ${space(4)} ${space(5)};
	display: flex;
	flex-direction: column;
	gap: ${space(1)};
	background: ${colors.surface};
`

export const CardTitle = styled.p`
	margin: 0;
	color: ${colors.inkMuted};
	font-size: ${fontSizes.sm};
	line-height: 1.4;
`

export const CardValue = styled.p`
	margin: 0;
	width: fit-content;
	border-radius: ${radii.sm};
	color: ${colors.ink};
	font-size: ${fontSizes.xxl};
	font-weight: 650;
	font-variant-numeric: tabular-nums;
	letter-spacing: -0.02em;
	line-height: 1.2;
	white-space: nowrap;

	&:focus-visible {
		${focusRing}
	}
`
