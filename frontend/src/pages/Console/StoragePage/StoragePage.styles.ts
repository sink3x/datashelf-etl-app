import { Card, Flex, List, Pagination, Space } from 'antd'
import styled from 'styled-components'

import { Button } from '@ui/Button/Button'

export const StorageSpace = styled(Flex)`
	margin-top: 0;
	flex-direction: column;
	align-items: start;
`

export const StorageContent = styled(Space)`
	margin-left: -20px;
`

export const StorageRawFileListNoData = styled(Flex)`
	margin-left: -10px;
	flex-direction: column;
`

export const StorageRawFileRefreshButton = styled(Button)`
	margin-left: 20px;
	margin-bottom: 30px;
`

export const RawFileList = styled(List)`
	margin-left: 10px;
`

export const CardContainer = styled(Card)`
	min-width: 17vw;
	cursor: pointer;
	transition: all 0.3s ease;

	&:hover {
		transform: translateY(-5px);
	}
`

export const CardTitle = styled(Flex)`
	width: 100%;
	align-items: center;

	span {
		width: 90%;
		margin-left: 7px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
`

export const CardDescription = styled(Flex)`
	flex-direction: column;
`

export const StoragePagination = styled(Pagination)`
	margin-bottom: 25px;
`
