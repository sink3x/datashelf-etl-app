import { colors, fonts } from './tokens'

import type { ThemeConfig } from 'antd'

export const antdTheme: ThemeConfig = {
	token: {
		colorPrimary: colors.accent,
		colorInfo: colors.accent,
		colorSuccess: colors.success,
		colorWarning: colors.warning,
		colorError: colors.danger,
		colorText: colors.ink,
		colorTextSecondary: colors.inkMuted,
		colorTextTertiary: colors.inkMuted,
		colorBorder: colors.lineStrong,
		colorBorderSecondary: colors.line,
		colorBgLayout: colors.canvas,
		colorBgContainer: colors.surface,
		fontFamily: fonts.sans,
		fontFamilyCode: fonts.mono,
		borderRadius: 8,
		controlHeight: 36,
	},
	components: {
		Button: {
			fontWeight: 500,
			primaryShadow: 'none',
			defaultShadow: 'none',
		},
	},
}
