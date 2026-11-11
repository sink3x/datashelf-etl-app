import { CircleQuestion } from '@gravity-ui/icons'
import { useTranslation } from 'react-i18next'

import { ROUTE_PATHS } from '@router/paths'
import { ButtonLink } from '@ui/ButtonLink/ButtonLink'

import { PageState } from '@components/PageState/PageState'

export const NotFoundPage = () => {
	const { t } = useTranslation()

	return (
		<PageState
			icon={<CircleQuestion />}
			title={t('consoleNotFound.title')}
			description={t('consoleNotFound.description')}
			actions={
				<ButtonLink to={ROUTE_PATHS.CONSOLE} type="primary">
					{t('consoleNotFound.goHome')}
				</ButtonLink>
			}
		/>
	)
}
