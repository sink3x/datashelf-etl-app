import { Flex, Typography } from 'antd'
import styled from 'styled-components'

import { LANDING_WIDTH } from '../../MainLayout.constants'

export const Header = styled.header`
	width: ${LANDING_WIDTH};
	margin-inline: auto;
	padding-block: 10px;
`

export const HeaderLogo = styled(Flex)`
	align-items: center;
`

export const Image = styled.img`
	width: 64px;
	margin-right: 15px;
	user-select: none;
	pointer-events: none;
`

export const HeaderLogoTitle = styled(Typography.Title)`
	margin: 0 !important;
`
