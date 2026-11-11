import styled from 'styled-components'

import { Button } from '@ui/Button/Button'

import { colors, fontSizes, media, radii, space } from '@styles/tokens'

export const LayoutContainer = styled.div`
	width: 100%;
	min-height: 100vh;
	display: flex;
	background: ${colors.canvas};
`

export const SkipLink = styled.a`
	padding: ${space(2)} ${space(3)};
	position: absolute;
	top: ${space(2)};
	left: ${space(2)};
	z-index: 100;
	border-radius: ${radii.sm};
	background: ${colors.ink};
	color: ${colors.surface};
	transform: translateY(-200%);

	&:focus {
		color: ${colors.surface};
		transform: none;
	}
`

export const MainContainer = styled.main`
	min-width: 0;
	flex: 1;
	display: flex;
	flex-direction: column;

	&:focus {
		outline: none;
	}
`

export const MobileBar = styled.div`
	display: none;

	${media.belowMd} {
		padding: ${space(2)} ${space(4)} ${space(2)} ${space(2)};
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		gap: ${space(2)};
		align-items: center;
		border-bottom: 1px solid ${colors.line};
		background: ${colors.surface};
	}
`

export const MenuButton = styled(Button)`
	color: ${colors.ink};
`

export const MobileBrand = styled.span`
	min-width: 0;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: ${colors.ink};
	font-size: ${fontSizes.lg};
	font-weight: 700;
`

export const PageContent = styled.div`
	width: 100%;
	max-width: 1320px;
	padding: ${space(8)} ${space(10)} ${space(12)};
	display: flex;
	flex-direction: column;
	align-items: flex-start;

	${media.belowLg} {
		padding: ${space(6)} ${space(6)} ${space(10)};
	}

	${media.belowMd} {
		padding: ${space(5)} ${space(4)} ${space(8)};
	}
`

export const LayoutTitle = styled.h1`
	margin: 0 0 ${space(4)};
	color: ${colors.ink};
	font-size: ${fontSizes.xxl};
	font-weight: 700;
	letter-spacing: -0.02em;
	line-height: 1.2;
`
