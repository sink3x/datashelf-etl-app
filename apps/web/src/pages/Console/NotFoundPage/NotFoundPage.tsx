import { CircleQuestion } from '@gravity-ui/icons'

import { ROUTE_PATHS } from '@router/paths'
import { ButtonLink } from '@ui/ButtonLink/ButtonLink'

import { PageState } from '@components/PageState/PageState'

export const NotFoundPage = () => (
	<PageState
		icon={<CircleQuestion />}
		title="This console page doesn’t exist"
		description="Check the address or pick a section from the navigation."
		actions={
			<ButtonLink to={ROUTE_PATHS.CONSOLE} type="primary">
				Go to console home
			</ButtonLink>
		}
	/>
)
