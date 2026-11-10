import type { FC, MouseEvent } from 'react'

import { Button } from 'antd'
import { useHref, useLinkClickHandler } from 'react-router-dom'

import type { IButtonLinkProps } from './ButtonLink.interfaces'

export const ButtonLink: FC<IButtonLinkProps> = (props) => {
	const { to, children, ...restProps } = props

	const href = useHref(to)
	const handleClick = useLinkClickHandler<HTMLElement>(to)

	return (
		<Button {...restProps} href={href} onClick={(event: MouseEvent<HTMLElement>) => handleClick(event)}>
			{children}
		</Button>
	)
}
