import { useEffect } from 'react'

import { File } from '@gravity-ui/icons'
import { Col, Empty, Row, Skeleton, Tooltip, Typography, type PaginationProps } from 'antd'
import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'

import { ERoutesPageNames, Routes } from '@router/routes'

import type { IRawFile } from '@interfaces/file-raw'
import { convertFileSize } from '@utils/convert-file-size'

import { RAW_FILE_SKELETON_ITEM_COUNT, SHOW_TOTAL } from './StoragePage.constants'
import { StoragePageStore } from './StoragePage.store'
import * as Styled from './StoragePage.styles'

const storagePageStore = new StoragePageStore()

export const StoragePage = observer(() => {
	const {
		rawFileList,
		isLoadingRawFileList,
		fetchRawFileList,
		page,
		totalCount,
		setPage,
		setPageSize,
		isRawFileListEmpty,
		reset,
	} = storagePageStore

	useEffect(() => {
		if (!isLoadingRawFileList) {
			fetchRawFileList({ isUpdateIsLoading: false })
		}

		return () => {
			reset()
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleChangeShowSize: PaginationProps['onShowSizeChange'] = (_currentPageNumber, pageSize) => {
		setPageSize(pageSize)
		fetchRawFileList()
	}

	const handleChangePageNumber: PaginationProps['onChange'] = (pageNumber) => {
		setPage(pageNumber)
		fetchRawFileList()
	}

	const handleClickRefreshRawFileList = () => {
		fetchRawFileList()
	}

	return (
		<Styled.StorageSpace>
			<Styled.StorageContent>
				<Row gutter={4}>
					{isLoadingRawFileList &&
						[...new Array(RAW_FILE_SKELETON_ITEM_COUNT)].map((_, index) => (
							<Col key={index}>
								<Styled.CardContainer
									style={{
										marginBottom: '16px',
										marginLeft: '12px',
									}}
									title={
										<Styled.CardTitle>
											<Skeleton active paragraph={{ rows: 1, width: ['70%'] }} title={false} />
										</Styled.CardTitle>
									}
								>
									<Skeleton active paragraph={{ rows: 2, width: ['10%', '50%'] }} title={false} />
								</Styled.CardContainer>
							</Col>
						))}
				</Row>
				{!isLoadingRawFileList && isRawFileListEmpty && (
					<Styled.StorageRawFileListNoData>
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
						<Styled.StorageRawFileRefreshButton onClick={handleClickRefreshRawFileList}>
							Refresh
						</Styled.StorageRawFileRefreshButton>
					</Styled.StorageRawFileListNoData>
				)}
				{!isLoadingRawFileList && !isRawFileListEmpty && (
					<Styled.RawFileList
						grid={{ gutter: 16, column: 4 }}
						dataSource={rawFileList}
						// @ts-ignore
						renderItem={(item: IRawFile) => {
							const lastModifiedFormatted = DateTime.fromISO(item.lastModified, { zone: 'utc' })
								.setZone('local')
								.toFormat('dd.MM.yyyy HH:mm:ss')

							return (
								<Styled.RawFileList.Item>
									<Link to={Routes[ERoutesPageNames.CONSOLE]!.children!.CONSOLE_DASHBOARD!.fullPath!}>
										<Tooltip placement="bottom" title="Click to open dashboard">
											<Styled.CardContainer
												title={
													<Styled.CardTitle>
														<File /> <span>{item.fileName}</span>
													</Styled.CardTitle>
												}
											>
												<Styled.CardDescription>
													<Typography> {convertFileSize(item.size)}</Typography>
													<Typography> {lastModifiedFormatted}</Typography>
												</Styled.CardDescription>
											</Styled.CardContainer>
										</Tooltip>
									</Link>
								</Styled.RawFileList.Item>
							)
						}}
					/>
				)}
			</Styled.StorageContent>
			<Styled.StoragePagination
				disabled={isRawFileListEmpty}
				current={page}
				total={totalCount}
				showTotal={SHOW_TOTAL!}
				showSizeChanger
				showQuickJumper
				onShowSizeChange={handleChangeShowSize}
				onChange={handleChangePageNumber}
			/>
		</Styled.StorageSpace>
	)
})
