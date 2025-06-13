import { Typography } from 'antd'
import { Menu } from 'react-pro-sidebar'
import { useLocation, useNavigate } from 'react-router-dom'

import { ERouterElementType } from '@router/routes.interfaces'

import * as Styled from '../Sidebar.styles'
import { getExtenedNavigationElementsInGroups, getNavigationElementsInGroups } from '../Siderbar.utils'

export const SidebarBody = () => {
	const navigate = useNavigate()
	const { pathname } = useLocation()

	const navigationElementsInGroup = getNavigationElementsInGroups()
	const extendedNavigationElementsInGroup = getExtenedNavigationElementsInGroups(navigationElementsInGroup)

	const handleClickNavigateInElement = (path: string) => () => {
		navigate(path)
	}

	return (
		<Styled.SidebarBody>
			{Object.keys(extendedNavigationElementsInGroup).map((navigationGroupName, index) => {
				return (
					<Styled.SidebarGroup key={navigationGroupName} $groupIndex={index}>
						<Styled.SidebarGroupTitle>
							<Typography>{navigationGroupName.toLocaleUpperCase()}</Typography>
						</Styled.SidebarGroupTitle>
						<Menu>
							{extendedNavigationElementsInGroup[navigationGroupName]?.map((menuElement) => {
								const isActive = pathname === menuElement.fullPath! // TODO: fix nested path don't work

								if (menuElement?.type === ERouterElementType.EXTERNAL_LINK) {
									return (
										<Styled.SiderbarGroupLink
											href={menuElement.fullPath}
											target="_blank"
											rel="noreferrer"
											key={menuElement.name}
										>
											<span>
												<span className="icon">{menuElement.icon}</span>
												{menuElement.name}
											</span>
										</Styled.SiderbarGroupLink>
									)
								}

								return (
									<Styled.SiderbarGroupItem
										$isActive={isActive}
										key={menuElement.name}
										onClick={handleClickNavigateInElement(menuElement.fullPath!)}
										disabled={!!menuElement?.isDisabled}
									>
										<span>
											<span className="icon">{menuElement.icon}</span>
											{menuElement.name}
										</span>
									</Styled.SiderbarGroupItem>
								)
							})}
						</Menu>
					</Styled.SidebarGroup>
				)
			})}
		</Styled.SidebarBody>
	)
}
