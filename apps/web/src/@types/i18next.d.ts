import 'i18next'

import type { TTranslationResources } from '@shared/i18n/i18n.interfaces'

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'translation'
		resources: {
			translation: TTranslationResources
		}
	}
}
