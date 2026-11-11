import { useEffect, useState } from 'react'

import { ArrowRotateRight, File, FolderOpen, TriangleExclamation } from '@gravity-ui/icons'
import { Skeleton } from 'antd'
import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

import { getDashboardPath, ROUTE_PATHS } from '@router/paths'
import { Button } from '@ui/Button/Button'
import { ButtonLink } from '@ui/ButtonLink/ButtonLink'

import { PageState } from '@components/PageState/PageState'
import { convertFileSize } from '@utils/convert-file-size'

import { PAGE_SIZE_OPTIONS, RAW_FILE_SKELETON_ITEM_COUNT } from './StoragePage.constants'
import { StoragePageStore } from './StoragePage.store'
import * as Styled from './StoragePage.styles'

const UPLOAD_PATH = ROUTE_PATHS.CONSOLE_UPLOAD

const formatModifiedAt = (isoDate: string) => {
	const date = DateTime.fromISO(isoDate, { zone: 'utc' }).setZone('local')

	return date.isValid ? date.toFormat('dd LLL yyyy, HH:mm') : isoDate
}

export const StoragePage = observer(() => {
	const [store] = useState(() => new StoragePageStore())
	const { t } = useTranslation()

	const { rawFileList, isLoading, errorMessage, isEmpty, page, pageSize, totalCount } = store

	useEffect(() => {
		void store.fetchRawFileList()
	}, [store])

	const handleRefresh = () => {
		void store.fetchRawFileList()
	}

	const renderContent = () => {
		if (isLoading && isEmpty) {
			return (
				<Styled.FileGrid aria-busy="true" aria-label={t('storage.loading')}>
					{Array.from({ length: RAW_FILE_SKELETON_ITEM_COUNT }, (_, index) => (
						<Styled.FileCardSkeleton key={index}>
							<Skeleton active title={false} paragraph={{ rows: 3, width: ['80%', '40%', '60%'] }} />
						</Styled.FileCardSkeleton>
					))}
				</Styled.FileGrid>
			)
		}

		if (errorMessage) {
			return (
				<PageState
					tone="error"
					icon={<TriangleExclamation />}
					title={t('storage.loadError')}
					description={errorMessage}
					actions={
						<Button type="primary" onClick={handleRefresh}>
							{t('common.tryAgain')}
						</Button>
					}
				/>
			)
		}

		if (isEmpty) {
			return (
				<PageState
					icon={<FolderOpen />}
					title={t('storage.emptyTitle')}
					description={t('storage.emptyDescription')}
					actions={
						<ButtonLink to={UPLOAD_PATH} type="primary">
							{t('common.uploadDataset')}
						</ButtonLink>
					}
				/>
			)
		}

		return (
			<>
				<Styled.FileGrid>
					{rawFileList.map((file) => (
						<li key={file.key}>
							<Styled.FileCard
								to={getDashboardPath(file.fileName)}
								aria-label={t('storage.openDashboard', { fileName: file.fileName })}
							>
								<Styled.FileIcon aria-hidden>
									<File />
								</Styled.FileIcon>
								<Styled.FileName title={file.fileName}>{file.fileName}</Styled.FileName>
								<Styled.FileMeta>
									<span>{convertFileSize(file.size)}</span>
									<span>{formatModifiedAt(file.lastModified)}</span>
								</Styled.FileMeta>
							</Styled.FileCard>
						</li>
					))}
				</Styled.FileGrid>
				<Styled.StoragePagination
					current={page}
					pageSize={pageSize}
					total={totalCount}
					pageSizeOptions={PAGE_SIZE_OPTIONS}
					showSizeChanger
					showTotal={(total) => t('storage.fileCount', { count: total })}
					onChange={store.setPagination}
					disabled={isLoading}
				/>
			</>
		)
	}

	return (
		<Styled.StoragePage>
			<Styled.Toolbar>
				<Styled.ToolbarText>{t('storage.intro')}</Styled.ToolbarText>
				<Styled.ToolbarActions>
					<Button
						icon={<ArrowRotateRight aria-hidden />}
						onClick={handleRefresh}
						loading={isLoading && !isEmpty}
					>
						{t('common.refresh')}
					</Button>
					<ButtonLink to={UPLOAD_PATH} type="primary">
						{t('common.upload')}
					</ButtonLink>
				</Styled.ToolbarActions>
			</Styled.Toolbar>
			{renderContent()}
		</Styled.StoragePage>
	)
})
