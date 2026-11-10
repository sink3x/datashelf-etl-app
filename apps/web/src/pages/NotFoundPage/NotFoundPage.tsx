import { ROUTE_PATHS } from '@router/paths'
import { ButtonLink } from '@ui/ButtonLink/ButtonLink'

import NOT_FOUND_IMAGE_URL from '@assets/images/background/not-found.webp'
import { MainLayout } from '@layouts/MainLayout/MainLayout'

import * as Styled from './NotFoundPage.styles'

export const NotFoundPage = () => (
	<MainLayout>
		<Styled.NotFoundMain>
			<Styled.NotFoundImage src={NOT_FOUND_IMAGE_URL} alt="" />
			<Styled.NotFoundText>
				<Styled.NotFoundTitle>This page doesn’t exist</Styled.NotFoundTitle>
				<Styled.NotFoundParagraph>
					The link may be outdated or mistyped. Go back to the start page or open the console.
				</Styled.NotFoundParagraph>
				<ButtonLink to={ROUTE_PATHS.WELCOME} type="primary">
					Back to start page
				</ButtonLink>
			</Styled.NotFoundText>
		</Styled.NotFoundMain>
	</MainLayout>
)
