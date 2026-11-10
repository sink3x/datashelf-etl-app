import styled from 'styled-components'

import { colors, focusRing, fontSizes, radii, space } from '@styles/tokens'

export const Badge = styled.span`
	padding: 2px ${space(2)};
	display: inline-flex;
	align-items: center;
	border: 1px solid ${colors.warning};
	border-radius: ${radii.pill};
	background: ${colors.warningSoft};
	color: ${colors.warning};
	font-size: ${fontSizes.xs};
	font-weight: 600;
	line-height: 18px;
	white-space: nowrap;
	cursor: help;

	&:focus-visible {
		${focusRing}
	}
`
