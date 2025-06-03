import { Col, Row } from 'antd'
import { useNavigate } from 'react-router-dom'

import { ERoutesPageNames, Routes } from '@router/routes'
import { Button } from '@ui/Button/Button'

import { MainLayout } from '@layouts/MainLayout/MainLayout'
import { APP_CONFIG } from '@shared/config/config'

import { CASE_ITEM_LIST, WELCOME_DESCRIPTION, WELCOME_TITLE } from './WelcomePage.constants'
import * as Styled from './WelcomePage.styles'

const { urls } = APP_CONFIG

export const WelcomePage = () => {
	const navigate = useNavigate()

	const handleClickOpenConsole = () => {
		navigate(Routes[ERoutesPageNames.CONSOLE]!.path)
	}

	return (
		<MainLayout>
			<Styled.WelcomePage>
				<main>
					<Styled.DescriptionSpace>
						<Styled.DescriptionTitle>{WELCOME_TITLE}</Styled.DescriptionTitle>
						<Styled.DescriptionParagraph>{WELCOME_DESCRIPTION}</Styled.DescriptionParagraph>
						<Styled.DescriptionActionSpace>
							<Button type="primary" onClick={handleClickOpenConsole}>
								Open console
							</Button>
							<a href={urls.contactUsUrl} target="_blank" rel="noreferrer">
								<Styled.ButtonBlack ghost>Contact us</Styled.ButtonBlack>
							</a>
						</Styled.DescriptionActionSpace>
					</Styled.DescriptionSpace>
					<Styled.CaseItemShowcase>
						<Row gutter={[24, 24]}>
							{CASE_ITEM_LIST.map((caseItem) => (
								<Col key={caseItem.title}>
									<Styled.CaseItem
										icon={caseItem.icon}
										title={caseItem.title}
										description={caseItem.description}
									/>
								</Col>
							))}
						</Row>
					</Styled.CaseItemShowcase>
				</main>
			</Styled.WelcomePage>
		</MainLayout>
	)
}
