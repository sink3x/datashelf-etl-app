import { Divider, Flex, Space, Typography } from 'antd'
import { MenuItem, Sidebar } from 'react-pro-sidebar'
import styled from 'styled-components'

import { EColorsMain } from '@styles/colors/colors-main'

import type { ISidebarGroupProps, ISiderbarGroupItemProps } from './Sidebar.interfaces'

export const SidebarContainer = styled(Sidebar)`
	height: 100vh;
	position: fixed !important;
`

export const SidebarHeader = styled(Flex)`
	padding: 20px;
	margin-bottom: 0;
	align-items: center;
`

export const LogoSpace = styled(Flex)`
	align-items: center;
	cursor: pointer;
`

export const LogoImage = styled.img`
	width: 37px;
	margin-right: 10px;
	user-select: none;
	pointer-events: none;
`

export const LogoText = styled(Typography.Text)`
	font-size: 20px;
	font-weight: 800;
`

export const SidebarDivider = styled(Divider)`
	margin: 0;
`

export const SidebarBody = styled(Flex)`
	flex: 1;
	flex-direction: column;
	margin-top: 32px;
`

export const SidebarGroup = styled(Space)<ISidebarGroupProps>`
	display: block;
	margin-top: ${({ $groupIndex }) => ($groupIndex > 0 ? '60px' : 'initial')};
`

export const SidebarGroupTitle = styled(Space)`
	padding: 0 20px;
	margin-bottom: 8px;
	font-weight: bold;
`

const menuItemStyles = ($isActive = false) => `
	color: ${EColorsMain.BLACK};

	span {
		${$isActive && 'color:' + EColorsMain.BLUE};
		display: flex;
		align-items: center;

		.icon {
			margin-right: 10px;
		}
	}

	* {
		${$isActive && `pointer-events: none`};
	}
`

export const SiderbarGroupItem = styled(MenuItem)<ISiderbarGroupItemProps>`
	${({ $isActive }) => menuItemStyles($isActive)}
`

export const SiderbarGroupLink = styled.a<ISiderbarGroupItemProps>`
	${({ $isActive }) => menuItemStyles($isActive)}

	width: 100%;
	height: 50px;
	padding-right: 20px;
	padding-left: 20px;
	display: flex;
	align-items: center;
	position: relative;
	cursor: pointer;
	box-sizing: border-box;
	transition: none;

	&:hover {
		color: ${EColorsMain.BLACK};
		background-color: #f3f3f3;
	}
`
