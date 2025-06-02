import { Divider, Flex, Space, Typography } from 'antd'
import { MenuItem } from 'react-pro-sidebar'
import styled from 'styled-components'

import type { ISidebarGroupProps } from './Sidebar.interfaces'

export const SidebarContainer = styled(Flex)`
	flex-direction: column;
	height: 100vh;
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

export const SiderbarGroupItem = styled(MenuItem)`
	span {
		display: flex;
		align-items: center;

		.icon {
			margin-right: 10px;
		}
	}
`
