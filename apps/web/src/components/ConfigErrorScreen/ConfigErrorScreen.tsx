import type { FC } from 'react'

import { Trans, useTranslation } from 'react-i18next'

import * as Styled from './ConfigErrorScreen.styles'

import type { IConfigErrorScreenProps } from './ConfigErrorScreen.interfaces'

export const ConfigErrorScreen: FC<IConfigErrorScreenProps> = (props) => {
	const { issues, title, description } = props

	const { t } = useTranslation()

	return (
		<Styled.Screen role="alert" aria-labelledby="config-error-title">
			<Styled.Panel>
				<Styled.Title id="config-error-title">{title ?? t('configError.title')}</Styled.Title>
				<Styled.Text>
					{description ?? <Trans i18nKey="configError.description" components={{ code: <code /> }} />}
				</Styled.Text>
				<Styled.IssueList>
					{issues.map((issue) => (
						<li key={`${issue.path}:${issue.message}`}>
							<code>{issue.path}</code>
							<span>{issue.message}</span>
						</li>
					))}
				</Styled.IssueList>
				<Styled.ReloadButton type="button" onClick={() => window.location.reload()}>
					{t('common.reloadPage')}
				</Styled.ReloadButton>
			</Styled.Panel>
		</Styled.Screen>
	)
}
