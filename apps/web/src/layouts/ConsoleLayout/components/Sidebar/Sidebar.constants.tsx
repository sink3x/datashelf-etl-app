import { BookOpen } from '@gravity-ui/icons'

import { ERouterElementType, type IRouterElement } from '@router/routes.interfaces'

import { getAppConfig } from '@shared/config/config'

const { urls } = getAppConfig()

export const EXTENTED_SUPPORT_GROUP: IRouterElement[] = [
	{
		path: urls.documentationUrl,
		fullPath: urls.documentationUrl,
		name: 'Documentation',
		icon: <BookOpen />,
		type: ERouterElementType.EXTERNAL_LINK,
	},
]
