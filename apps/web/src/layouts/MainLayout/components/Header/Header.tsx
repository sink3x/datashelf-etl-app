import { Link } from 'react-router-dom'

import { ROUTE_PATHS } from '@router/paths'

import DATASHELF_LOGO_URL from '@assets/images/logo/datashelf.webp'

import * as Styled from './Header.styles'

export const Header = () => {
	return (
		<Styled.Header>
			<Link to={ROUTE_PATHS.WELCOME} aria-label="Datashelf home">
				<Styled.HeaderLogo>
					<Styled.Image src={DATASHELF_LOGO_URL} alt="" />
					<Styled.HeaderLogoTitle>Datashelf</Styled.HeaderLogoTitle>
				</Styled.HeaderLogo>
			</Link>
		</Styled.Header>
	)
}
