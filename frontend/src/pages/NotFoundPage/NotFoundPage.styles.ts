import { Space } from 'antd'
import styled from 'styled-components'

import { LANDING_WIDTH } from '@layouts/MainLayout/MainLayout.constants'

export const NotFoundMainAccent = styled(Space)`
	width: ${LANDING_WIDTH};
`

export const NotFoundImage = styled.img`
	width: 300px;
	margin-right: 30px;
	user-select: none;
	pointer-events: none;
`

export const NotFoundTextSpace = styled(Space)`
	width: 500px;
	display: block;
`
