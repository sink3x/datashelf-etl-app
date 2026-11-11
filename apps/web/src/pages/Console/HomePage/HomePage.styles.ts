import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { colors, focusRing, fonts, fontSizes, radii, space } from '@styles/tokens'

export const HomePage = styled.div`
	width: 100%;
	max-width: 960px;
	display: flex;
	flex-direction: column;
	gap: ${space(8)};
`

export const Intro = styled.p`
	margin: 0;
	max-width: 62ch;
	color: ${colors.inkMuted};
	font-size: ${fontSizes.lg};
	line-height: 1.6;
`

export const ActionList = styled.ul`
	margin: 0;
	padding: 0;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: ${space(3)};
	list-style: none;
`

export const ActionLink = styled(Link)`
	height: 100%;
	padding: ${space(5)};
	display: flex;
	flex-direction: column;
	gap: ${space(2)};
	border: 1px solid ${colors.line};
	border-radius: ${radii.lg};
	background: ${colors.surface};
	color: ${colors.ink};
	transition: border-color 0.15s ease;

	&:hover {
		border-color: ${colors.accent};
		color: ${colors.ink};
	}

	&:focus-visible {
		${focusRing}
	}
`

export const ActionIcon = styled.span`
	width: 36px;
	height: 36px;
	margin-bottom: ${space(2)};
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: ${radii.md};
	background: ${colors.accentSoft};
	color: ${colors.accent};
`

export const ActionTitle = styled.span`
	font-size: ${fontSizes.lg};
	font-weight: 600;
`

export const ActionDescription = styled.span`
	color: ${colors.inkMuted};
	font-size: ${fontSizes.md};
	line-height: 1.5;
`

export const Recent = styled.section`
	display: flex;
	flex-direction: column;
	gap: ${space(3)};
`

export const RecentTitle = styled.h2`
	margin: 0;
	font-size: ${fontSizes.lg};
	font-weight: 600;
`

export const RecentList = styled.ul`
	margin: 0;
	padding: 0;
	list-style: none;
	border-top: 1px solid ${colors.line};

	li {
		padding: ${space(3)} 0;
		display: flex;
		gap: ${space(3)};
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid ${colors.line};
	}
`

const recentNameStyles = `
	min-width: 0;
	overflow: hidden;
	font-family: ${fonts.mono};
	font-size: ${fontSizes.md};
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const RecentLink = styled(Link)`
	${recentNameStyles}

	color: ${colors.accent};

	&:focus-visible {
		${focusRing}
	}
`

export const RecentName = styled.span`
	${recentNameStyles}
`
