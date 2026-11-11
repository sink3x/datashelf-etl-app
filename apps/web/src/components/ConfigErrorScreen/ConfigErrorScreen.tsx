import type { FC } from 'react'

import * as Styled from './ConfigErrorScreen.styles'

import type { IConfigErrorScreenProps } from './ConfigErrorScreen.interfaces'

export const ConfigErrorScreen: FC<IConfigErrorScreenProps> = (props) => {
	const { issues, title = 'The console can’t start', description } = props

	return (
		<Styled.Screen role="alert" aria-labelledby="config-error-title">
			<Styled.Panel>
				<Styled.Title id="config-error-title">{title}</Styled.Title>
				<Styled.Text>
					{description ?? (
						<>
							The runtime configuration in <code>app-config.js</code> is missing or invalid. Fix the values
							below and reload the page. In the container they come from the <code>API_URL</code>,{' '}
							<code>DOCS_URL</code>, <code>CONTACT_URL</code> and <code>DEFAULT_DAG_ID</code> environment
							variables.
						</>
					)}
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
					Reload page
				</Styled.ReloadButton>
			</Styled.Panel>
		</Styled.Screen>
	)
}
