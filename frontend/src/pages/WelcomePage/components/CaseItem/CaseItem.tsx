import type { FC } from 'react'

import * as Styled from './CaseItem.styles'

import type { ICaseItemProps } from './CaseItem.interfaces'

export const CaseItem: FC<ICaseItemProps> = (props) => {
	const { icon, title, description, ...restProps } = props

	return (
		<Styled.CaseItem {...restProps}>
			<Styled.CaseItemTitle>
				<Styled.CaseItemIconWrapper> {icon} </Styled.CaseItemIconWrapper>
				{title}
			</Styled.CaseItemTitle>
			<Styled.CaseItemDescription> {description} </Styled.CaseItemDescription>
		</Styled.CaseItem>
	)
}
