import type { ButtonProps } from 'antd'

export interface IButtonLinkProps extends Omit<ButtonProps, 'href' | 'onClick'> {
	to: string
}
