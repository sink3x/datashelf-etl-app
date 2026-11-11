import type { FC } from 'react'

import * as Styled from './StatusBadge.styles'

import type { IStatusBadgeProps } from './StatusBadge.interfaces'

const STATE_LABELS: Record<IStatusBadgeProps['state'], string> = {
	queued: 'Queued',
	running: 'Running',
	success: 'Succeeded',
	failed: 'Failed',
}

export const StatusBadge: FC<IStatusBadgeProps> = (props) => {
	const { state } = props

	return (
		<Styled.Badge $state={state}>
			<Styled.Dot aria-hidden $state={state} />
			{STATE_LABELS[state] ?? state}
		</Styled.Badge>
	)
}
