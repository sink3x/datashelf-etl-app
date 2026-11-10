import { Sidebar, type MenuItemStyles } from 'react-pro-sidebar'
import styled from 'styled-components'

import { colors, fonts, fontSizes, radii, space } from '@styles/tokens'

export const SidebarContainer = styled(Sidebar)`
	height: 100vh;
	flex: none;
	border-right: 1px solid ${colors.line} !important;

	&:not(.ps-broken) {
		position: sticky !important;
		top: 0;
	}

	.ps-sidebar-container {
		background: ${colors.surface};
	}
`

export const SidebarInner = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
	font-family: ${fonts.sans};
`

export const SidebarHeader = styled.div`
	padding: ${space(5)} ${space(5)} ${space(4)};
	display: flex;
	gap: ${space(3)};
	align-items: center;
`

export const LogoImage = styled.img`
	width: 32px;
	height: 32px;
	user-select: none;
	pointer-events: none;
`

export const LogoText = styled.span`
	color: ${colors.ink};
	font-size: ${fontSizes.lg};
	font-weight: 700;
	letter-spacing: -0.01em;
`

export const SidebarNav = styled.div`
	flex: 1;
	padding: ${space(2)} 0;
	display: flex;
	flex-direction: column;
	gap: ${space(6)};
	overflow-y: auto;
`

export const SidebarGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${space(1)};
`

export const SidebarGroupTitle = styled.h2`
	margin: 0;
	padding: 0 ${space(5)};
	color: ${colors.inkMuted};
	font-size: ${fontSizes.xs};
	font-weight: 600;
`

export const SidebarFooter = styled.div`
	padding: ${space(4)} ${space(5)};

	&:empty {
		display: none;
	}
`

export const menuItemStyles: MenuItemStyles = {
	root: {
		padding: `0 ${space(3)}`,
	},
	button: ({ active }) => ({
		height: '38px',
		paddingLeft: space(2),
		paddingRight: space(2),
		borderRadius: radii.sm,
		color: active ? colors.accent : colors.ink,
		backgroundColor: active ? colors.accentSoft : 'transparent',
		fontSize: fontSizes.md,
		fontWeight: active ? 600 : 500,
		'&:hover': {
			backgroundColor: active ? colors.accentSoft : colors.surfaceSunken,
			color: active ? colors.accent : colors.ink,
		},
		'&:focus-visible': {
			outline: `2px solid ${colors.accent}`,
			outlineOffset: '-2px',
		},
	}),
	icon: ({ active }) => ({
		minWidth: '28px',
		width: '28px',
		marginRight: space(2),
		color: active ? colors.accent : colors.inkMuted,
	}),
}
