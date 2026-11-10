import { Tooltip } from 'antd'

import { IS_API_MOCK } from '@shared/constants'

import * as Styled from './DemoBadge.styles'

export const DemoBadge = () => {
	if (!IS_API_MOCK) {
		return null
	}

	return (
		<Tooltip title="Requests are answered by an in-browser mock API. Uploads simulate a pipeline run.">
			<Styled.Badge tabIndex={0}>Demo mode — mock data</Styled.Badge>
		</Tooltip>
	)
}
