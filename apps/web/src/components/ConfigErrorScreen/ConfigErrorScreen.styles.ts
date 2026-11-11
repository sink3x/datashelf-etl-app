import styled from 'styled-components'

import { colors, focusRing, fonts, fontSizes, radii, space } from '@styles/tokens'

export const Screen = styled.main`
	min-height: 100vh;
	padding: ${space(6)} ${space(4)};
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${colors.canvas};
	color: ${colors.ink};
	font-family: ${fonts.sans};
`

export const Panel = styled.section`
	width: 100%;
	max-width: 560px;
	padding: ${space(8)};
	border: 1px solid ${colors.line};
	border-radius: ${radii.lg};
	background: ${colors.surface};

	code {
		font-family: ${fonts.mono};
		font-size: 0.92em;
	}
`

export const Title = styled.h1`
	margin: 0 0 ${space(3)};
	font-size: ${fontSizes.xl};
	font-weight: 650;
`

export const Text = styled.p`
	margin: 0 0 ${space(5)};
	color: ${colors.inkMuted};
	font-size: ${fontSizes.md};
	line-height: 1.6;
`

export const IssueList = styled.ul`
	margin: 0 0 ${space(6)};
	padding: 0;
	list-style: none;
	border-top: 1px solid ${colors.line};

	li {
		padding: ${space(3)} 0;
		display: flex;
		flex-direction: column;
		gap: ${space(1)};
		border-bottom: 1px solid ${colors.line};
		font-size: ${fontSizes.md};
	}

	code {
		color: ${colors.danger};
	}
`

export const ReloadButton = styled.button`
	padding: ${space(2)} ${space(4)};
	border: 0;
	border-radius: ${radii.sm};
	background: ${colors.accent};
	color: ${colors.surface};
	font: inherit;
	font-size: ${fontSizes.md};
	font-weight: 600;
	cursor: pointer;

	&:hover {
		background: ${colors.accentHover};
	}

	&:focus-visible {
		${focusRing}
	}
`
