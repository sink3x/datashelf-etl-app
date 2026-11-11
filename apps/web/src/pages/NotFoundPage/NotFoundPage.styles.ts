import styled from 'styled-components'

import { LANDING_WIDTH } from '@layouts/MainLayout/MainLayout.constants'
import { colors, fontSizes, media, space } from '@styles/tokens'

export const NotFoundMain = styled.main`
	width: ${LANDING_WIDTH};
	margin: ${space(10)} auto;
	display: flex;
	gap: ${space(10)};
	align-items: center;

	${media.belowMd} {
		flex-direction: column;
		align-items: flex-start;
	}
`

export const NotFoundImage = styled.img`
	width: min(300px, 70%);
	user-select: none;
	pointer-events: none;
`

export const NotFoundText = styled.div`
	max-width: 52ch;
`

export const NotFoundTitle = styled.h1`
	margin: 0 0 ${space(3)};
	color: ${colors.ink};
	font-size: clamp(28px, 4vw, 40px);
	font-weight: 700;
	letter-spacing: -0.02em;
	line-height: 1.15;
`

export const NotFoundParagraph = styled.p`
	margin: 0 0 ${space(6)};
	color: ${colors.inkMuted};
	font-size: ${fontSizes.lg};
	line-height: 1.6;
`
