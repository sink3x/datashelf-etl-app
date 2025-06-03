import { Flex, Space, Typography } from 'antd'
import styled from 'styled-components'

import { EColorsMain } from '@styles/colors/colors-main'
import { EColorsShadow } from '@styles/colors/colors-shadow'

export const CaseItem = styled(Flex)`
	padding: 15px;
	flex-direction: column;
	border-radius: 15px;
	background-color: ${EColorsMain.WHITE};
	color: ${EColorsMain.BLACK};
	box-shadow:
		0 4px 24px ${EColorsShadow.BLACK_ELEMENT_BORDER},
		0 2px 8px ${EColorsShadow.BLACK_ELEMENT_BORDER};
	box-sizing: border-box;
`

export const CaseItemIconWrapper = styled(Space)`
	width: 40px;
	height: 40px;
`

export const CaseItemTitle = styled(Typography.Title)`
	display: flex;
	align-items: center;
	font-size: 20px !important;
`
export const CaseItemDescription = styled(Typography.Paragraph)`
	margin-left: 40px;
`
