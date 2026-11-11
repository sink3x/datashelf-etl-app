import { useEffect, useState, type FC } from 'react'

import { Bars } from '@gravity-ui/icons'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useMatches } from 'react-router-dom'

import { DemoBadge } from '@components/DemoBadge/DemoBadge'

import { Sidebar } from './components/Sidebar/Sidebar'
import * as Styled from './ConsoleLayout.styles'

import type { TNavKey } from '@router/routes.interfaces'

const getRouteTitleKey = (handle: unknown) =>
	handle && typeof handle === 'object' && 'titleKey' in handle && typeof handle.titleKey === 'string'
		? (handle.titleKey as TNavKey)
		: null

export const ConsoleLayout: FC = () => {
	const matches = useMatches()
	const { pathname } = useLocation()
	const { t } = useTranslation()
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

	const titleKey = getRouteTitleKey(matches.at(-1)?.handle)
	const title = titleKey ? t(titleKey) : ''

	useEffect(() => {
		document.title = title ? `${title} · Datashelf` : 'Datashelf'
	}, [title])

	useEffect(() => {
		setIsMobileSidebarOpen(false)
	}, [pathname])

	return (
		<Styled.LayoutContainer>
			<Styled.SkipLink href="#console-main">{t('layout.skipToContent')}</Styled.SkipLink>
			<Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
			<Styled.MainContainer id="console-main" tabIndex={-1}>
				<Styled.MobileBar>
					<Styled.MenuButton
						type="text"
						icon={<Bars aria-hidden />}
						aria-label={t('layout.openNavigation')}
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
