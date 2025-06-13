import { Geography } from 'react-simple-maps'
import styled, { keyframes } from 'styled-components'

import type { IGeographMapColoredProps } from './GeographMap.interfaces'

const pulseGlow = (glow: IGeographMapColoredProps['$glowColor']) => keyframes`
	0% {
		stroke-width: 1.5;
		filter: drop-shadow(0 0 3px ${glow});
	}
	40% {
		stroke-width: 4;
		filter: drop-shadow(0 0 14px ${glow});
	}
	60% {
		stroke-width: 4.5;
		filter: drop-shadow(0 0 18px ${glow});
	}
	100% {
		stroke-width: 1.5;
		filter: drop-shadow(0 0 3px ${glow});
	}
`

export const GeographMapColored = styled(Geography)<IGeographMapColoredProps>`
	outline: none;
	transition: all 0.4s ease;

	&:hover {
		stroke: ${({ $glowColor }) => $glowColor};
		transform: scale(1.005);
		cursor: pointer;
		outline: none;
		animation: ${({ $glowColor }) => pulseGlow($glowColor)} 2s infinite ease-in-out;
	}
`
