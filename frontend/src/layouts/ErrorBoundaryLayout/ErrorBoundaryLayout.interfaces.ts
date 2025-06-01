import type { ReactNode } from 'react'

export interface IFallbackContainerProps {
	error: Error
	resetErrorBoundary: () => void
}

export interface IErrorBoundaryLayoutProps {
	children: ReactNode
}
