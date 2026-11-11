import { Segmented } from 'antd'
import styled from 'styled-components'

import { fontSizes } from '@styles/tokens'

export const Switcher = styled(Segmented)`
	flex: none;
	font-size: ${fontSizes.xs};
	font-weight: 600;

	.ant-segmented-item-label {
		min-width: 32px;
		text-align: center;
	}
` as typeof Segmented

export const VisuallyHidden = styled.span`
	width: 1px;
	height: 1px;
	margin: -1px;
	padding: 0;
	position: absolute;
	overflow: hidden;
	clip: rect(0 0 0 0);
	white-space: nowrap;
	border: 0;
`
