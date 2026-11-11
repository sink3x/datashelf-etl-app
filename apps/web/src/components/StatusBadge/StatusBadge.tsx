import type { FC } from 'react'

import { useTranslation } from 'react-i18next'

import * as Styled from './StatusBadge.styles'

import type { IStatusBadgeProps } from './StatusBadge.interfaces'

export const StatusBadge: FC<IStatusBadgeProps> = (props) => {
	const { state } = props

	const { t } = useTranslation()

	return (
		<Styled.Badge $state={state}>
			<Styled.Dot aria-hidden $state={state} />
			{t(`runState.${state}`)}
		</Styled.Badge>
	)
}
