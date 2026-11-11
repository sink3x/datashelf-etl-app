import { type FC } from 'react'

import { Outlet, useMatches } from 'react-router-dom'

import { Sidebar } from './components/Sidebar/Sidebar'
import * as Styled from './ConsoleLayout.styles'

import type { IConsoleLayoutProps } from './ConsoleLayout.interfaces'

export const ConsoleLayout: FC<IConsoleLayoutProps> = () => {
	const matches = useMatches()

	const { title = '' } = matches.toReversed()[0]?.handle as { title: string }

	return (
		<Styled.LayoutContainer>
			<Sidebar />
			<Styled.MainContainer>
				<Styled.LayoutTitle> {title} </Styled.LayoutTitle>
				<Outlet />
			</Styled.MainContainer>
		</Styled.LayoutContainer>
	)
}
