import { useEffect, useState, type FC } from 'react'

import { Bars } from '@gravity-ui/icons'
import { Outlet, useLocation, useMatches } from 'react-router-dom'

import { DemoBadge } from '@components/DemoBadge/DemoBadge'

import { Sidebar } from './components/Sidebar/Sidebar'
import * as Styled from './ConsoleLayout.styles'

const getRouteTitle = (handle: unknown) =>
	handle && typeof handle === 'object' && 'title' in handle && typeof handle.title === 'string'
		? handle.title
		: ''

export const ConsoleLayout: FC = () => {
	const matches = useMatches()
	const { pathname } = useLocation()
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

	const title = getRouteTitle(matches.at(-1)?.handle)

	useEffect(() => {
		document.title = title ? `${title} · Datashelf` : 'Datashelf'
	}, [title])

	useEffect(() => {
		setIsMobileSidebarOpen(false)
	}, [pathname])

	return (
		<Styled.LayoutContainer>
			<Styled.SkipLink href="#console-main">Skip to content</Styled.SkipLink>
			<Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
			<Styled.MainContainer id="console-main" tabIndex={-1}>
				<Styled.MobileBar>
					<Styled.MenuButton
						type="text"
						icon={<Bars aria-hidden />}
						aria-label="Open navigation"
						aria-expanded={isMobileSidebarOpen}
						onClick={() => setIsMobileSidebarOpen(true)}
					/>
					<Styled.MobileBrand>Datashelf</Styled.MobileBrand>
					<DemoBadge />
				</Styled.MobileBar>
				<Styled.PageContent>
					{title && <Styled.LayoutTitle>{title}</Styled.LayoutTitle>}
					<Outlet />
				</Styled.PageContent>
			</Styled.MainContainer>
		</Styled.LayoutContainer>
	)
}
