import type { FC } from 'react'

import { Button, Result } from 'antd'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

import type { IErrorBoundaryLayoutProps, IFallbackContainerProps } from './ErrorBoundaryLayout.interfaces'

const FallbackContainer: FC<IFallbackContainerProps> = (props) => {
	const { error, resetErrorBoundary } = props

	return (
		<Result
			status="500"
			title="Something went wrong"
			subTitle={error.message}
			extra={
				<Button type="primary" onClick={resetErrorBoundary}>
					Reload page
				</Button>
			}
		/>
	)
}

export const ErrorBoundaryLayout: FC<IErrorBoundaryLayoutProps> = (props) => {
	const { children } = props

	const handleReloadPage = () => window.location.reload()

	return (
		<ReactErrorBoundary FallbackComponent={FallbackContainer} onReset={handleReloadPage}>
			{children}
		</ReactErrorBoundary>
	)
}
