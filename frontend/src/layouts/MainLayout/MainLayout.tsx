import type { FC } from 'react'

import { Header } from './components/Header/Header'
import * as Styled from './MainLayout.styles'

import type { IMainLayoutProps } from './MainLayout.interfaces'

export const MainLayout: FC<IMainLayoutProps> = (props) => {
	const { children } = props

	return (
		<Styled.MainLayout>
			<Header />
			{children}
		</Styled.MainLayout>
	)
}
