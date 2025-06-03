import type { FC } from 'react'

import { Button } from 'antd'

import { Header } from '@layouts/MainLayout/components/Header/Header'

import * as Styled from './FallbackContainer.styles'

import type { IFallbackContainerProps } from './FallbackContainer.interfaces'
export const FallbackContainer: FC<IFallbackContainerProps> = (props) => {
	const { error, resetErrorBoundary } = props

	return (
		<>
			<Header />
			<Styled.FallbackResult
				status="500"
				title="Something went wrong"
				subTitle={error.message}
				extra={
					<Button type="primary" onClick={resetErrorBoundary}>
						Reload page
					</Button>
				}
			/>
		</>
	)
}
