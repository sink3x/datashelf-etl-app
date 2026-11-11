import styled, { css, keyframes } from 'styled-components'

import type { TDagRunState } from '@interfaces/dag'
import { colors, fontSizes, radii, space } from '@styles/tokens'

interface IStateProps {
	$state: TDagRunState
}

const STATE_COLORS: Record<TDagRunState, { fg: string; bg: string }> = {
	queued: { fg: colors.inkMuted, bg: colors.surfaceSunken },
	running: { fg: colors.accent, bg: colors.accentSoft },
	success: { fg: colors.success, bg: colors.successSoft },
	failed: { fg: colors.danger, bg: colors.dangerSoft },
}

const pulse = keyframes`
	50% {
		opacity: 0.35;
	}
`

export const Badge = styled.span<IStateProps>`
	padding: 2px ${space(2)};
	display: inline-flex;
	gap: 6px;
	align-items: center;
	border-radius: ${radii.pill};
	background: ${({ $state }) => STATE_COLORS[$state]?.bg ?? colors.surfaceSunken};
	color: ${({ $state }) => STATE_COLORS[$state]?.fg ?? colors.inkMuted};
	font-size: ${fontSizes.xs};
	font-weight: 600;
	line-height: 20px;
	white-space: nowrap;
`

export const Dot = styled.span<IStateProps>`
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: currentcolor;

	${({ $state }) =>
		$state === 'running' &&
		css`
			animation: ${pulse} 1.2s ease-in-out infinite;

			@media (prefers-reduced-motion: reduce) {
				animation: none;
			}
		`}
`
