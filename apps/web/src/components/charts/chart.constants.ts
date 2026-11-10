import { colors, fonts } from '@styles/tokens'

export const CHART_HEIGHT = 300

export const CHART_THEME = {
	type: 'light',
	view: { viewFill: 'transparent' },
} as const

export const AXIS_STYLE = {
	labelFill: colors.inkMuted,
	labelFontFamily: fonts.sans,
	labelFontSize: 12,
	lineStroke: colors.line,
	tickStroke: colors.line,
	gridStroke: colors.line,
	gridLineDash: [3, 3],
	gridStrokeOpacity: 1,
} as const
