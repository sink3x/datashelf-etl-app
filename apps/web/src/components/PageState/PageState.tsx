import type { FC } from 'react'

import * as Styled from './PageState.styles'

import type { IPageStateProps } from './PageState.interfaces'

export const PageState: FC<IPageStateProps> = (props) => {
	const { tone = 'neutral', icon, title, description, actions } = props

	return (
		<Styled.Container role={tone === 'error' ? 'alert' : 'status'} $tone={tone}>
			{icon && (
				<Styled.Icon aria-hidden $tone={tone}>
					{icon}
				</Styled.Icon>
			)}
			<Styled.Body>
				<Styled.Title>{title}</Styled.Title>
				{description && <Styled.Description>{description}</Styled.Description>}
				{actions && <Styled.Actions>{actions}</Styled.Actions>}
			</Styled.Body>
		</Styled.Container>
	)
}
