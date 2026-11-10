import type { FC } from 'react'

import * as Styled from './CaseItem.styles'

import type { ICaseItemProps } from './CaseItem.interfaces'

export const CaseItem: FC<ICaseItemProps> = (props) => {
	const { icon, title, description, className } = props

	return (
		<Styled.CaseItem className={className}>
			<Styled.CaseItemIconWrapper aria-hidden>{icon}</Styled.CaseItemIconWrapper>
			<Styled.CaseItemTitle>{title}</Styled.CaseItemTitle>
			<Styled.CaseItemDescription>{description}</Styled.CaseItemDescription>
		</Styled.CaseItem>
	)
}
