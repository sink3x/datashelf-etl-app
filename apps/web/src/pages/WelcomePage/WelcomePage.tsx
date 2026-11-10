import { ERoutesPageNames, Routes } from '@router/routes'
import { Button } from '@ui/Button/Button'
import { ButtonLink } from '@ui/ButtonLink/ButtonLink'

import { MainLayout } from '@layouts/MainLayout/MainLayout'
import { getAppConfig } from '@shared/config/config'

import { CASE_ITEM_LIST, WELCOME_DESCRIPTION, WELCOME_TITLE } from './WelcomePage.constants'
import * as Styled from './WelcomePage.styles'

export const WelcomePage = () => {
	const { urls } = getAppConfig()

	return (
		<MainLayout>
			<Styled.WelcomePage>
				<Styled.Hero>
					<Styled.HeroInner>
						<Styled.HeroTitle>{WELCOME_TITLE}</Styled.HeroTitle>
						<Styled.HeroText>{WELCOME_DESCRIPTION}</Styled.HeroText>
						<Styled.HeroActions>
							<ButtonLink to={Routes[ERoutesPageNames.CONSOLE]!.path} type="primary" size="large">
								Open console
							</ButtonLink>
							{urls.contactUsUrl && (
								<Button size="large" href={urls.contactUsUrl} target="_blank" rel="noreferrer">
									Contact us
								</Button>
							)}
						</Styled.HeroActions>
					</Styled.HeroInner>
				</Styled.Hero>
				<Styled.CaseList aria-label="How it works">
					{CASE_ITEM_LIST.map((caseItem) => (
						<li key={caseItem.title}>
							<Styled.CaseItem
								icon={caseItem.icon}
								title={caseItem.title}
								description={caseItem.description}
							/>
						</li>
					))}
				</Styled.CaseList>
			</Styled.WelcomePage>
		</MainLayout>
	)
}
