import type { FC } from 'react'

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

import { FallbackContainer } from './components/FallbackContainer/FallbackContainer'

import type { IErrorBoundaryLayoutProps } from './ErrorBoundaryLayout.interfaces'

export const ErrorBoundaryLayout: FC<IErrorBoundaryLayoutProps> = (props) => {
	const { children } = props

	const handleReloadPage = () => window.location.reload()

	return (
		<ReactErrorBoundary FallbackComponent={FallbackContainer} onReset={handleReloadPage}>
			{children}
		</ReactErrorBoundary>
	)
}
