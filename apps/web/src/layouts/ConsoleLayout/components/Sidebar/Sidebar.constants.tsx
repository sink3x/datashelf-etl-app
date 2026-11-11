import { BookOpen, Comment } from '@gravity-ui/icons'

import type { IAppConfig } from '@shared/config/config.interface'

import type { ISidebarNavItem } from './Sidebar.interfaces'

export const SIDEBAR_WIDTH = '248px'

export const getSupportNavItems = (urls: IAppConfig['urls']): ISidebarNavItem[] =>
	[
		{
			key: 'documentation',
			name: 'API documentation',
			icon: <BookOpen />,
			to: urls.documentationUrl,
			isExternal: true,
		},
		{
			key: 'contact',
			name: 'Contact',
			icon: <Comment />,
			to: urls.contactUsUrl,
			isExternal: true,
		},
	].filter((item) => item.to)
