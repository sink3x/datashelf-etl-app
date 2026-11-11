import type { FC } from 'react'

import { Button } from 'antd'
import { useTranslation } from 'react-i18next'

import { Header } from '@layouts/MainLayout/components/Header/Header'

import * as Styled from './FallbackContainer.styles'

import type { IFallbackContainerProps } from './FallbackContainer.interfaces'
export const FallbackContainer: FC<IFallbackContainerProps> = (props) => {
	const { error, resetErrorBoundary } = props

	const { t } = useTranslation()

	return (
		<>
			<Header />
			<Styled.FallbackResult
				status="500"
				title={t('errorBoundary.title')}
				subTitle={error.message}
				extra={
					<Button type="primary" onClick={resetErrorBoundary}>
						{t('common.reloadPage')}
					</Button>
				}
			/>
		</>
	)
}
