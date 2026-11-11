import DATASHELF_LOGO_URL from '@assets/images/logo/datashelf.webp'

import * as Styled from '../Sidebar.styles'

export const SidebarHeader = () => (
	<Styled.SidebarHeader>
		<Styled.LogoImage src={DATASHELF_LOGO_URL} alt="" />
		<Styled.LogoText>Datashelf</Styled.LogoText>
	</Styled.SidebarHeader>
)
