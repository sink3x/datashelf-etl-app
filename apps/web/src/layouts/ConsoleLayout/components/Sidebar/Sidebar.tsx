import type { FC } from 'react'

import { Menu, MenuItem } from 'react-pro-sidebar'
import { Link, useLocation } from 'react-router-dom'

import { ROUTE_PATHS } from '@router/paths'

import { DemoBadge } from '@components/DemoBadge/DemoBadge'
import { getAppConfig } from '@shared/config/config'
import { breakpoints, colors } from '@styles/tokens'

import { SidebarHeader } from './components/SidebarHeader'
import { SIDEBAR_WIDTH } from './Sidebar.constants'
import * as Styled from './Sidebar.styles'
import { getNavigationGroups, isNavItemActive } from './Sidebar.utils'

import type { ISidebarProps } from './Sidebar.interfaces'

const CONSOLE_ROOT_PATH = ROUTE_PATHS.CONSOLE

export const Sidebar: FC<ISidebarProps> = (props) => {
	const { isMobileOpen, onMobileClose } = props

	const { pathname } = useLocation()
	const { urls } = getAppConfig()

	const navigationGroups = getNavigationGroups(urls)

	return (
		<Styled.SidebarContainer
			width={SIDEBAR_WIDTH}
			backgroundColor={colors.surface}
			customBreakPoint={`${breakpoints.md - 1}px`}
			toggled={isMobileOpen}
			onBackdropClick={onMobileClose}
		>
			<Styled.SidebarInner>
				<Link to={CONSOLE_ROOT_PATH} aria-label="Datashelf console home">
					<SidebarHeader />
				</Link>
				<Styled.SidebarNav aria-label="Console">
					{navigationGroups.map((group) => (
						<Styled.SidebarGroup key={group.name}>
							<Styled.SidebarGroupTitle id={`nav-group-${group.name}`}>{group.name}</Styled.SidebarGroupTitle>
							<Menu menuItemStyles={Styled.menuItemStyles} aria-labelledby={`nav-group-${group.name}`}>
								{group.items.map((item) => {
									const isActive = isNavItemActive(item, pathname, CONSOLE_ROOT_PATH)

									return (
										<MenuItem
											key={item.key}
											icon={item.icon}
											active={isActive}
											aria-current={isActive ? 'page' : undefined}
											component={
												item.isExternal ? (
													<a href={item.to} target="_blank" rel="noreferrer" />
												) : (
													<Link to={item.to} onClick={onMobileClose} />
												)
											}
										>
											{item.name}
										</MenuItem>
									)
								})}
							</Menu>
						</Styled.SidebarGroup>
					))}
				</Styled.SidebarNav>
				<Styled.SidebarFooter>
					<DemoBadge />
				</Styled.SidebarFooter>
			</Styled.SidebarInner>
		</Styled.SidebarContainer>
	)
}
