import { Files, FolderArrowUpIn, Pipeline } from '@gravity-ui/icons'
import { observer } from 'mobx-react-lite'

import { ERoutesPageNames, Routes } from '@router/routes'
import { runsStore } from '@stores/runs-store'

import { StatusBadge } from '@components/StatusBadge/StatusBadge'

import * as Styled from './HomePage.styles'

const consoleRoutes = Routes[ERoutesPageNames.CONSOLE]!.children!
const getDashboardPath = consoleRoutes[ERoutesPageNames.CONSOLE_DASHBOARD_BY_FILENAME]!.getFullPathDynamic!

const ACTIONS = [
	{
		to: consoleRoutes[ERoutesPageNames.CONSOLE_UPLOAD]!.fullPath!,
		icon: <FolderArrowUpIn />,
		title: 'Upload a dataset',
		description: 'Send a CSV or JSON file to storage and start the ETL pipeline on it.',
	},
	{
		to: consoleRoutes[ERoutesPageNames.CONSOLE_FILES]!.fullPath!,
		icon: <Files />,
		title: 'Browse storage',
		description: 'Find an uploaded file and open the dashboard built from it.',
	},
	{
		to: consoleRoutes[ERoutesPageNames.CONSOLE_PIPELINES]!.fullPath!,
		icon: <Pipeline />,
		title: 'Check pipelines',
		description: 'See which Airflow pipelines are active and follow your recent runs.',
	},
]

export const HomePage = observer(() => {
	const latestRuns = runsStore.runs.slice(0, 3)

	return (
		<Styled.HomePage>
			<Styled.Intro>
				Datashelf turns raw retail transactions into a dashboard: upload a file, let Airflow process it, then
				explore sales, customers and seasonal products.
			</Styled.Intro>
			<Styled.ActionList>
				{ACTIONS.map((action) => (
					<li key={action.to}>
						<Styled.ActionLink to={action.to}>
							<Styled.ActionIcon aria-hidden>{action.icon}</Styled.ActionIcon>
							<Styled.ActionTitle>{action.title}</Styled.ActionTitle>
							<Styled.ActionDescription>{action.description}</Styled.ActionDescription>
						</Styled.ActionLink>
					</li>
				))}
			</Styled.ActionList>
			{latestRuns.length > 0 && (
				<Styled.Recent aria-labelledby="home-recent-runs">
					<Styled.RecentTitle id="home-recent-runs">Your latest runs</Styled.RecentTitle>
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
