import styled from 'styled-components'

import { colors, fontSizes, space } from '@styles/tokens'

import { LANDING_WIDTH } from '../../MainLayout.constants'

export const Header = styled.header`
	width: ${LANDING_WIDTH};
	margin: 0 auto;
	padding: ${space(5)} 0;
	display: flex;
	gap: ${space(4)};
	align-items: center;
	justify-content: space-between;
`

export const HeaderLogo = styled.span`
	display: inline-flex;
	gap: ${space(3)};
	align-items: center;
	color: ${colors.ink};
`

export const Image = styled.img`
	width: 40px;
	height: 40px;
	user-select: none;
	pointer-events: none;
`

export const HeaderLogoTitle = styled.span`
	font-size: ${fontSizes.xl};
	font-weight: 700;
	letter-spacing: -0.01em;
`
