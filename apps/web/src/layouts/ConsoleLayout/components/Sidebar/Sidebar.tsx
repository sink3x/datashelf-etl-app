import { Link } from 'react-router-dom'

import { ERoutesPageNames, Routes } from '@router/routes'

import { SidebarBody } from './components/SidebarBody'
import { SidebarHeader } from './components/SidebarHeader'
import * as Styled from './Sidebar.styles'

export const Sidebar = () => {
	return (
		<Styled.SidebarContainer>
			<Link to={Routes[ERoutesPageNames.CONSOLE]!.path}>
				<SidebarHeader />
			</Link>
			<Styled.SidebarDivider />
			<SidebarBody />
		</Styled.SidebarContainer>
	)
}
