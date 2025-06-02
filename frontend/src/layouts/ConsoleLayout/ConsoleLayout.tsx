import { type FC } from 'react'

import { Outlet } from 'react-router-dom'

import { Sidebar } from './components/Sidebar/Sidebar'
import * as Styled from './ConsoleLayout.styles'

import type { IConsoleLayoutProps } from './ConsoleLayout.interfaces'

export const ConsoleLayout: FC<IConsoleLayoutProps> = () => {
	return (
		<Styled.LayoutContainer>
			<Sidebar />
			<Styled.MainContainer>
				<Outlet />
			</Styled.MainContainer>
		</Styled.LayoutContainer>
	)
}
