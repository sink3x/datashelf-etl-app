import { StrictMode, type FC } from 'react'

import { USE_STRICT_MODE } from '@shared/constants'

import type { IStrictModeWrapperProps } from './StrictModeWrapper.interfaces'

export const StrictModeWrapper: FC<IStrictModeWrapperProps> = ({ children }) => {
	if (!USE_STRICT_MODE) {
		return children
	}

	return <StrictMode> {children}</StrictMode>
}
