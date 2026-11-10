import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Button } from '@ui/Button/Button'

import { colors, focusRing, fonts, fontSizes, radii, space } from '@styles/tokens'

type TTone = 'success' | 'muted' | 'danger'

const TONE_COLORS: Record<TTone, { fg: string; bg: string }> = {
	success: { fg: colors.success, bg: colors.successSoft },
	muted: { fg: colors.inkMuted, bg: colors.surfaceSunken },
	danger: { fg: colors.danger, bg: colors.dangerSoft },
}

export const PipelinesPage = styled.div`
	width: 100%;
	max-width: 960px;
	display: flex;
	flex-direction: column;
	gap: ${space(10)};
`

export const Section = styled.section`
	display: flex;
	flex-direction: column;
	gap: ${space(4)};
`

export const SectionHeader = styled.header`
	padding-bottom: ${space(3)};
	border-bottom: 1px solid ${colors.line};
`

export const SectionTitle = styled.h2`
	margin: 0;
	color: ${colors.ink};
	font-size: ${fontSizes.xl};
	font-weight: 650;
`

export const SectionDescription = styled.p`
	margin: ${space(1)} 0 0;
	max-width: 70ch;
	color: ${colors.inkMuted};
	font-size: ${fontSizes.md};
	line-height: 1.5;
`

export const Panel = styled.div`
	margin: 0;
	padding: ${space(2)} ${space(5)};
	list-style: none;
	border: 1px solid ${colors.line};
	border-radius: ${radii.lg};
	background: ${colors.surface};
`

const Row = styled.li`
	padding: ${space(4)} 0;
	display: flex;
	gap: ${space(4)};
	align-items: flex-start;
	justify-content: space-between;

	& + & {
		border-top: 1px solid ${colors.line};
	}
`

export const DagRow = Row
export const RunRow = Row

export const DagMain = styled.div`
	min-width: 0;
`

export const RunMain = DagMain

export const DagName = styled.h3`
	margin: 0;
	color: ${colors.ink};
	font-size: ${fontSizes.lg};
	font-weight: 600;
`

export const DagDescription = styled.p`
	margin: ${space(1)} 0 0;
	color: ${colors.inkMuted};
	font-size: ${fontSizes.md};
`

export const DagMeta = styled.div`
	margin-top: ${space(2)};
	display: flex;
	flex-wrap: wrap;
	gap: ${space(1)} ${space(3)};
	align-items: center;
	color: ${colors.inkMuted};
	font-size: ${fontSizes.xs};

	code {
		max-width: 100%;
		overflow: hidden;
		font-family: ${fonts.mono};
		text-overflow: ellipsis;
		white-space: nowrap;
	}
`

export const Tag = styled.span`
	padding: 0 ${space(2)};
	border: 1px solid ${colors.line};
	border-radius: ${radii.pill};
	line-height: 20px;
`

export const DagStatus = styled.span<{ $tone: TTone }>`
	padding: 2px ${space(2)};
	flex: none;
	border-radius: ${radii.pill};
	background: ${({ $tone }) => TONE_COLORS[$tone].bg};
	color: ${({ $tone }) => TONE_COLORS[$tone].fg};
	font-size: ${fontSizes.xs};
	font-weight: 600;
	line-height: 20px;
`

const runFileStyles = `
	display: block;
	overflow: hidden;
	font-family: ${fonts.mono};
	font-size: ${fontSizes.md};
	font-weight: 500;
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const RunFile = styled(Link)`
	${runFileStyles}

	color: ${colors.accent};

	&:hover {
		color: ${colors.accentHover};
		text-decoration: underline;
	}

	&:focus-visible {
		${focusRing}
	}
`

export const RunFileText = styled.span`
	${runFileStyles}

	color: ${colors.ink};
`

export const RunError = styled.p`
	margin: ${space(2)} 0 0;
	color: ${colors.danger};
	font-size: ${fontSizes.sm};
`

export const ClearButton = styled(Button)`
	align-self: flex-start;
	padding-inline: 0;
	color: ${colors.inkMuted};
`
