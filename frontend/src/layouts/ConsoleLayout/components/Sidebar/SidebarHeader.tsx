import type { FC } from 'react'

import DATASHELF_LOGO_URL from '@assets/images/logo/datashelf.webp'

import * as Styled from './Sidebar.styles'

import type { ISidebarHeaderProps } from './Sidebar.interfaces'

export const SidebarHeader: FC<ISidebarHeaderProps> = (props) => {
	const { ...restProps } = props

	return (
		<Styled.SidebarHeader {...restProps}>
			<Styled.LogoSpace>
				<Styled.LogoImage src={DATASHELF_LOGO_URL} alt="🧊" />
				<Styled.LogoText>Datashelf</Styled.LogoText>
			</Styled.LogoSpace>
		</Styled.SidebarHeader>
	)
}
