import type { FC } from 'react'

import { Button as ButtonAntd } from 'antd'

import type { IButtonProps } from './Button.interfaces'

export const Button: FC<IButtonProps> = (props) => {
	const { children, ...restProps } = props

	return <ButtonAntd {...restProps}>{children}</ButtonAntd>
}
