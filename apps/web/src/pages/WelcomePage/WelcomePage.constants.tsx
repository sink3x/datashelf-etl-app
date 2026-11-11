import type { ReactNode } from 'react'

import { ChartColumn, DisplayPulse, FolderArrowUpIn, Pipeline } from '@gravity-ui/icons'

import type { TTranslationResources } from '@shared/i18n/i18n.interfaces'

export const CASE_ITEM_LIST: Array<{ id: keyof TTranslationResources['welcome']['cases']; icon: ReactNode }> =
	[
		{ id: 'upload', icon: <FolderArrowUpIn /> },
		{ id: 'process', icon: <Pipeline /> },
		{ id: 'follow', icon: <DisplayPulse /> },
		{ id: 'explore', icon: <ChartColumn /> },
	]
