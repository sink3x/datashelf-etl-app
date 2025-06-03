import { Flex, Space, Typography } from 'antd'
import styled from 'styled-components'

import { Button } from '@ui/Button/Button'

import WELCOME_DESCRIPTION_BACKGROUND_IMAGE_URL from '@assets/images/background/violet-lines-background.webp'
import { LANDING_WIDTH } from '@layouts/MainLayout/MainLayout.constants'
import { EColorsMain } from '@styles/colors/colors-main'

import { CaseItem as CaseItemVanila } from './components/CaseItem/CaseItem'

export const WelcomePage = styled(Space)`
	margin-bottom: 20px;
	color: ${EColorsMain.BLACK};
	box-sizing: border-box;
`

export const DescriptionSpace = styled(Space)`
	width: 100vw;
	min-height: 230px;
	display: flex;
	flex-direction: column;
	background-image: url(${WELCOME_DESCRIPTION_BACKGROUND_IMAGE_URL});
	background-position: center top;
	background-size: cover;
	animation: move-background 10s linear infinite;

	@keyframes move-background {
		from {
			background-position: center top;
		}

		to {
			background-position: center bottom;
		}
	}
`

export const DescriptionTitle = styled(Typography.Title)`
	width: ${LANDING_WIDTH};
	font-size: 2.3em !important;
`

export const DescriptionParagraph = styled(Typography.Paragraph)`
	width: ${LANDING_WIDTH};
	font-size: 1.3em;
`

export const DescriptionActionSpace = styled(Space)`
	width: ${LANDING_WIDTH};
`

export const ButtonBlack = styled(Button)`
	color: ${EColorsMain.BLACK} !important;
	border: 1px solid ${EColorsMain.BLACK} !important;
	transition: all 0.3s ease;

	&:hover {
		opacity: 0.4;
	}
`

export const CaseItemShowcase = styled(Flex)`
	width: ${LANDING_WIDTH};
	margin-top: 5vh;
	margin-inline: auto;
	flex-wrap: wrap;
`

export const CaseItem = styled(CaseItemVanila)`
	width: 350px;
	min-height: 180px;
	transition: transform 0.2s ease-out;

	&:hover {
		transform: translateY(-5px);
	}
`
