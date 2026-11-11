import { Geography } from 'react-simple-maps'
import styled from 'styled-components'

import { colors } from '@styles/tokens'

export const MapContainer = styled.div`
	width: 100%;

	svg {
		width: 100%;
		height: auto;
		display: block;
	}
`

export const State = styled(Geography)`
	outline: none;
	transition: fill 0.2s ease;

	&:hover {
		stroke: ${colors.ink};
		stroke-width: 1.5;
		outline: none;
	}

	&:focus {
		outline: none;
	}
`
