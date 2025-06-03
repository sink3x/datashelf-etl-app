import { Typography } from 'antd'
import styled from 'styled-components'

export const LayoutContainer = styled.div`
	width: 100%;
	height: 100vh;
	display: flex;
`

export const LayoutTitle = styled(Typography.Title)`
	margin-top: 0;
`

export const MainContainer = styled.main`
	padding: 16px 32px;
	margin-left: 250px;
	margin-top: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: start;
	overflow: auto;
`
