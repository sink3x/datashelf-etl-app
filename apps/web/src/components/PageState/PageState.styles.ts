import styled from 'styled-components'

import { colors, fontSizes, radii, space } from '@styles/tokens'

import type { TPageStateTone } from './PageState.interfaces'

interface IToneProps {
	$tone: TPageStateTone
}

export const Container = styled.section<IToneProps>`
	width: 100%;
	padding: ${space(8)} ${space(6)};
	display: flex;
	gap: ${space(4)};
	align-items: flex-start;
	border: 1px ${({ $tone }) => ($tone === 'error' ? 'solid' : 'dashed')}
		${({ $tone }) => ($tone === 'error' ? colors.danger : colors.lineStrong)};
	border-radius: ${radii.lg};
	background: ${({ $tone }) => ($tone === 'error' ? colors.dangerSoft : colors.surface)};
`

export const Icon = styled.span<IToneProps>`
	width: 40px;
	height: 40px;
	flex: none;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: ${radii.md};
	background: ${({ $tone }) => ($tone === 'error' ? colors.surface : colors.accentSoft)};
	color: ${({ $tone }) => ($tone === 'error' ? colors.danger : colors.accent)};

	svg {
		width: 20px;
		height: 20px;
	}
`

export const Body = styled.div`
	min-width: 0;
	max-width: 62ch;
`

export const Title = styled.h2`
	margin: 0 0 ${space(1)};
	color: ${colors.ink};
	font-size: ${fontSizes.lg};
	font-weight: 600;
	line-height: 1.4;
`

export const Description = styled.div`
	color: ${colors.inkMuted};
	font-size: ${fontSizes.md};
	line-height: 1.6;
	overflow-wrap: anywhere;
`

export const Actions = styled.div`
	margin-top: ${space(4)};
	display: flex;
	flex-wrap: wrap;
	gap: ${space(2)};
`
