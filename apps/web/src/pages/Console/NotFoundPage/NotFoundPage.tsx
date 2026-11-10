import { useNavigate } from 'react-router-dom'

import { ERoutesPageNames, Routes } from '@router/routes'
import { Button } from '@ui/Button/Button'

import * as Styled from './NotFoundPage.styles'

export const NotFoundPage = () => {
	const navigate = useNavigate()

	const handleClickBackHome = () => {
		navigate(Routes[ERoutesPageNames.CONSOLE]!.children!.CONSOLE_HOME!.fullPath!)
	}

	return (
		<Styled.ConsoleNotFoundResult
			status="404"
			title="Page not found"
			subTitle="Sorry, the page you visited does not exist."
			extra={
				<Button type="primary" onClick={handleClickBackHome}>
					Back Home
				</Button>
			}
		/>
	)
}
