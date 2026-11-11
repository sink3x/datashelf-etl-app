import styled from 'styled-components'

import { colors, fontSizes, radii, space } from '@styles/tokens'

export const CaseItem = styled.div`
	padding: ${space(5)};
	display: flex;
	flex-direction: column;
	gap: ${space(2)};
	border: 1px solid ${colors.line};
	background-color: ${colors.surface};
	color: ${colors.ink};
`

export const CaseItemIconWrapper = styled.span`
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

export const CaseItemTitle = styled.h2`
	margin: 0;
	font-size: ${fontSizes.lg};
	font-weight: 650;
`

export const CaseItemDescription = styled.p`
	margin: 0;
	color: ${colors.inkMuted};
	font-size: ${fontSizes.md};
	line-height: 1.6;
`
