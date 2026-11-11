import { Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

import { ERoutesPageNames, Routes } from '@router/routes'
import { Button } from '@ui/Button/Button'

import NOT_FOUND_IMAGE_URl from '@assets/images/background/not-found.webp'
import { MainLayout } from '@layouts/MainLayout/MainLayout'

import * as Styled from './NotFoundPage.styles'

export const NotFoundPage = () => {
	const navigate = useNavigate()

	const handleClickBackToHome = () => {
		navigate(Routes[ERoutesPageNames.HOME].path)
	}

	return (
		<MainLayout>
			<main>
				<Styled.NotFoundMainAccent>
					<Styled.NotFoundImage src={NOT_FOUND_IMAGE_URl} />
					<Styled.NotFoundTextSpace>
						<Typography.Title>Oops! The page you’re looking for took a wrong turn.</Typography.Title>
						<Typography.Paragraph>
							It seems this URL wandered off into the digital wilderness. Try going back home or use the
							search to find your way.
						</Typography.Paragraph>
						<Button type="primary" onClick={handleClickBackToHome}>
							Back to home
						</Button>
					</Styled.NotFoundTextSpace>
				</Styled.NotFoundMainAccent>
			</main>
		</MainLayout>
	)
}
