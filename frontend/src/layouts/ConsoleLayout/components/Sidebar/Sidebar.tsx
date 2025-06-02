import { Sidebar as ReactProSidebar } from 'react-pro-sidebar'
import { Link } from 'react-router-dom'

import { ERoutesPageNames, Routes } from '@router/routes'

import * as Styled from './Sidebar.styles'
import { SidebarBody } from './SidebarBody'
import { SidebarHeader } from './SidebarHeader'

export const Sidebar = () => {
	return (
		<ReactProSidebar>
			<Styled.SidebarContainer>
				<Link to={Routes[ERoutesPageNames.CONSOLE]!.path}>
					<SidebarHeader />
				</Link>
				<Styled.SidebarDivider />
				<SidebarBody />
			</Styled.SidebarContainer>
		</ReactProSidebar>
	)
}
