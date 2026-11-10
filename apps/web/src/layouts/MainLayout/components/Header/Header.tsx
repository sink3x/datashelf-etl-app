import { Link } from 'react-router-dom'

import { ERoutesPageNames, Routes } from '@router/routes'

import DATASHELF_LOGO_URL from '@assets/images/logo/datashelf.webp'

import * as Styled from './Header.styles'

export const Header = () => {
	return (
		<Styled.Header>
			<Link to={Routes[ERoutesPageNames.WELCOME]!.path}>
				<Styled.HeaderLogo>
					<Styled.Image src={DATASHELF_LOGO_URL} alt="🧊" />
					<Styled.HeaderLogoTitle>Datashelf</Styled.HeaderLogoTitle>
				</Styled.HeaderLogo>
			</Link>
		</Styled.Header>
	)
}
