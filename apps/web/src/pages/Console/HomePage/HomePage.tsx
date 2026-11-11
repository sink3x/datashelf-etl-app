import type { ReactNode } from 'react'

import { Files, FolderArrowUpIn, Pipeline } from '@gravity-ui/icons'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

import { getDashboardPath, ROUTE_PATHS } from '@router/paths'
import { runsStore } from '@stores/runs-store'

import { StatusBadge } from '@components/StatusBadge/StatusBadge'
import type { TTranslationResources } from '@shared/i18n/i18n.interfaces'

import * as Styled from './HomePage.styles'

const ACTIONS: Array<{ id: keyof TTranslationResources['home']['actions']; to: string; icon: ReactNode }> = [
	{ id: 'upload', to: ROUTE_PATHS.CONSOLE_UPLOAD, icon: <FolderArrowUpIn /> },
	{ id: 'storage', to: ROUTE_PATHS.CONSOLE_FILES, icon: <Files /> },
	{ id: 'pipelines', to: ROUTE_PATHS.CONSOLE_PIPELINES, icon: <Pipeline /> },
]

export const HomePage = observer(() => {
	const { t } = useTranslation()

	const latestRuns = runsStore.runs.slice(0, 3)

	return (
		<Styled.HomePage>
			<Styled.Intro>{t('home.intro')}</Styled.Intro>
			<Styled.ActionList>
				{ACTIONS.map((action) => (
					<li key={action.to}>
						<Styled.ActionLink to={action.to}>
							<Styled.ActionIcon aria-hidden>{action.icon}</Styled.ActionIcon>
							<Styled.ActionTitle>{t(`home.actions.${action.id}.title`)}</Styled.ActionTitle>
							<Styled.ActionDescription>
								{t(`home.actions.${action.id}.description`)}
							</Styled.ActionDescription>
						</Styled.ActionLink>
					</li>
				))}
			</Styled.ActionList>
			{latestRuns.length > 0 && (
				<Styled.Recent aria-labelledby="home-recent-runs">
					<Styled.RecentTitle id="home-recent-runs">{t('home.latestRuns')}</Styled.RecentTitle>
					<Styled.RecentList>
						{latestRuns.map((run) => (
							<li key={run.dagRunId}>
								{run.state === 'success' ? (
									<Styled.RecentLink to={getDashboardPath(run.filename)}>{run.filename}</Styled.RecentLink>
								) : (
									<Styled.RecentName>{run.filename}</Styled.RecentName>
								)}
								<StatusBadge state={run.state} />
							</li>
						))}
					</Styled.RecentList>
				</Styled.Recent>
			)}
		</Styled.HomePage>
	)
})
