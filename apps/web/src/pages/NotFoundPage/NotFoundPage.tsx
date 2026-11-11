import { useTranslation } from 'react-i18next'

import { ROUTE_PATHS } from '@router/paths'
import { ButtonLink } from '@ui/ButtonLink/ButtonLink'

import NOT_FOUND_IMAGE_URL from '@assets/images/background/not-found.webp'
import { MainLayout } from '@layouts/MainLayout/MainLayout'

import * as Styled from './NotFoundPage.styles'

export const NotFoundPage = () => {
	const { t } = useTranslation()

	return (
		<MainLayout>
			<Styled.NotFoundMain>
				<Styled.NotFoundImage src={NOT_FOUND_IMAGE_URL} alt="" />
				<Styled.NotFoundText>
					<Styled.NotFoundTitle>{t('notFound.title')}</Styled.NotFoundTitle>
					<Styled.NotFoundParagraph>{t('notFound.description')}</Styled.NotFoundParagraph>
					<ButtonLink to={ROUTE_PATHS.WELCOME} type="primary">
						{t('notFound.backToStart')}
					</ButtonLink>
				</Styled.NotFoundText>
			</Styled.NotFoundMain>
		</MainLayout>
	)
}
