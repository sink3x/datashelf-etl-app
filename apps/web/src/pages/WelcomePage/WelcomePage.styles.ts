import styled from 'styled-components'

import WELCOME_BACKGROUND_IMAGE_URL from '@assets/images/background/violet-lines-background.webp'
import { LANDING_WIDTH } from '@layouts/MainLayout/MainLayout.constants'
import { colors, fontSizes, media, radii, space } from '@styles/tokens'

import { CaseItem as CaseItemBase } from './components/CaseItem/CaseItem'

export const WelcomePage = styled.main`
	padding-bottom: ${space(16)};
	display: flex;
	flex-direction: column;
	gap: ${space(10)};
`

export const Hero = styled.section`
	width: 100%;
	padding: ${space(16)} 0;
	background-color: ${colors.accentSoft};
	background-image: url(${WELCOME_BACKGROUND_IMAGE_URL});
	background-position: center;
	background-size: cover;

	${media.belowMd} {
		padding: ${space(10)} 0;
	}
`

export const HeroInner = styled.div`
	width: ${LANDING_WIDTH};
	margin: 0 auto;
`

export const HeroTitle = styled.h1`
	max-width: 18ch;
	margin: 0 0 ${space(4)};
	color: ${colors.ink};
	font-size: clamp(32px, 6vw, 56px);
	font-weight: 750;
	letter-spacing: -0.03em;
	line-height: 1.05;
`

export const HeroText = styled.p`
	max-width: 56ch;
	margin: 0 0 ${space(8)};
	color: ${colors.ink};
	font-size: ${fontSizes.lg};
	line-height: 1.6;
`

export const HeroActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: ${space(3)};
`

export const CaseList = styled.ol`
	width: ${LANDING_WIDTH};
	margin: 0 auto;
	padding: 0;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: ${space(4)};
	list-style: none;
`

export const CaseItem = styled(CaseItemBase)`
	height: 100%;
	border-radius: ${radii.lg};
`
