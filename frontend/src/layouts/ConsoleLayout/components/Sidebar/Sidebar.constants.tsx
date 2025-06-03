import { BookOpen } from '@gravity-ui/icons'

import { ERouterElementType, type IRouterElement } from '@router/routes.interfaces'

import { APP_CONFIG } from '@shared/config/config'

const { urls } = APP_CONFIG

export const EXTENTED_SUPPORT_GROUP: IRouterElement[] = [
	{
		path: urls.documentationUrl,
		fullPath: urls.documentationUrl,
		name: 'Documentation',
		icon: <BookOpen />,
		type: ERouterElementType.EXTERNAL_LINK,
	},
]
