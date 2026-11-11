import { useTranslation } from 'react-i18next'

import { ROUTE_PATHS } from '@router/paths'
import { Button } from '@ui/Button/Button'
import { ButtonLink } from '@ui/ButtonLink/ButtonLink'

import { MainLayout } from '@layouts/MainLayout/MainLayout'
import { getAppConfig } from '@shared/config/config'

import { CASE_ITEM_LIST } from './WelcomePage.constants'
import * as Styled from './WelcomePage.styles'

export const WelcomePage = () => {
	const { urls } = getAppConfig()
	const { t } = useTranslation()

	return (
		<MainLayout>
			<Styled.WelcomePage>
				<Styled.Hero>
					<Styled.HeroInner>
						<Styled.HeroTitle>{t('welcome.title')}</Styled.HeroTitle>
						<Styled.HeroText>{t('welcome.description')}</Styled.HeroText>
						<Styled.HeroActions>
							<ButtonLink to={ROUTE_PATHS.CONSOLE} type="primary" size="large">
								{t('welcome.openConsole')}
							</ButtonLink>
							{urls.contactUsUrl && (
								<Button size="large" href={urls.contactUsUrl} target="_blank" rel="noreferrer">
									{t('welcome.contactUs')}
								</Button>
							)}
						</Styled.HeroActions>
					</Styled.HeroInner>
				</Styled.Hero>
				<Styled.CaseList aria-label={t('welcome.howItWorks')}>
					{CASE_ITEM_LIST.map((caseItem) => (
						<li key={caseItem.id}>
							<Styled.CaseItem
								icon={caseItem.icon}
								title={t(`welcome.cases.${caseItem.id}.title`)}
								description={t(`welcome.cases.${caseItem.id}.description`)}
							/>
						</li>
					))}
				</Styled.CaseList>
			</Styled.WelcomePage>
		</MainLayout>
	)
}
