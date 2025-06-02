import { Typography } from 'antd'
import { Menu } from 'react-pro-sidebar'
import { useNavigate } from 'react-router-dom'

import * as Styled from './Sidebar.styles'
import { getNavigationElementsInGroups } from './Siderbar.utils'

export const SidebarBody = () => {
	const navigate = useNavigate()

	const navigationElementsInGroup = getNavigationElementsInGroups()

	const handleClickNavigateInElement = (path: string) => () => {
		navigate(path)
	}

	return (
		<Styled.SidebarBody>
			{Object.keys(navigationElementsInGroup).map((navigationGroupName, index) => {
				return (
					<Styled.SidebarGroup key={navigationGroupName} $groupIndex={index}>
						<Styled.SidebarGroupTitle>
							<Typography>{navigationGroupName.toLocaleUpperCase()}</Typography>
						</Styled.SidebarGroupTitle>
						<Menu>
							{navigationElementsInGroup[navigationGroupName]?.map((menuElement) => (
								<Styled.SiderbarGroupItem
									key={menuElement.name}
									onClick={handleClickNavigateInElement(menuElement.fullPath!)}
								>
									<span>
										<span className="icon">{menuElement.icon}</span>
										{menuElement.name}
									</span>
								</Styled.SiderbarGroupItem>
							))}
						</Menu>
					</Styled.SidebarGroup>
				)
			})}
		</Styled.SidebarBody>
	)
}
