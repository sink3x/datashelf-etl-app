import { useEffect, useState } from 'react'

import { Pipeline, TriangleExclamation } from '@gravity-ui/icons'
import { Skeleton } from 'antd'
import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'

import { ERoutesPageNames, Routes } from '@router/routes'
import { runsStore } from '@stores/runs-store'
import { Button } from '@ui/Button/Button'
import { ButtonLink } from '@ui/ButtonLink/ButtonLink'

import { PageState } from '@components/PageState/PageState'
import { StatusBadge } from '@components/StatusBadge/StatusBadge'
import { useInterval } from '@hooks/use-interval'
import type { IDag } from '@interfaces/dag'

import { PipelinesPageStore } from './PipelinesPage.store'
import * as Styled from './PipelinesPage.styles'

const consoleRoutes = Routes[ERoutesPageNames.CONSOLE]!.children!
const UPLOAD_PATH = consoleRoutes[ERoutesPageNames.CONSOLE_UPLOAD]!.fullPath!
const getDashboardPath = consoleRoutes[ERoutesPageNames.CONSOLE_DASHBOARD_BY_FILENAME]!.getFullPathDynamic!

const RUNS_POLL_INTERVAL_MS = 5000

const formatRelative = (isoDate: string) => DateTime.fromISO(isoDate).toRelative() ?? isoDate

const getDagStatus = (dag: IDag) => {
	if (dag.has_import_errors) {
		return { label: 'Import errors', tone: 'danger' as const }
	}

	if (dag.is_paused) {
		return { label: 'Paused', tone: 'muted' as const }
	}

	return { label: 'Active', tone: 'success' as const }
}

const DagList = observer(({ store }: { store: PipelinesPageStore }) => {
	const { dagList, isLoading, errorMessage, fetchDagList } = store

	if (isLoading) {
		return (
			<Styled.Panel aria-busy="true" aria-label="Loading pipelines">
				<Skeleton active title={false} paragraph={{ rows: 3 }} />
			</Styled.Panel>
		)
	}

	if (errorMessage) {
		return (
			<PageState
				tone="error"
				icon={<TriangleExclamation />}
				title="Couldn’t load pipelines from Airflow"
				description={errorMessage}
				actions={
					<Button type="primary" onClick={() => void fetchDagList()}>
						Try again
					</Button>
				}
			/>
		)
	}

	if (!dagList.length) {
		return (
			<PageState
				icon={<Pipeline />}
				title="Airflow has no pipelines"
				description="Check that the DAG files are mounted into Airflow and that the DAG processor has parsed them."
			/>
		)
	}

	return (
		<Styled.Panel as="ul">
			{dagList.map((dag) => {
				const status = getDagStatus(dag)
				const schedule = dag.timetable_description || dag.timetable_summary

				return (
					<Styled.DagRow key={dag.dag_id}>
						<Styled.DagMain>
							<Styled.DagName>{dag.dag_display_name || dag.dag_id}</Styled.DagName>
							{dag.description && <Styled.DagDescription>{dag.description}</Styled.DagDescription>}
							<Styled.DagMeta>
								<code>{dag.dag_id}</code>
								{schedule && <span>Schedule: {schedule}</span>}
								{dag.tags?.map((tag) => <Styled.Tag key={tag.name}>{tag.name}</Styled.Tag>)}
							</Styled.DagMeta>
						</Styled.DagMain>
						<Styled.DagStatus $tone={status.tone}>{status.label}</Styled.DagStatus>
					</Styled.DagRow>
				)
			})}
		</Styled.Panel>
	)
})

const RecentRuns = observer(() => {
	const { runs, activeRuns, refreshActiveRuns, clear } = runsStore

	useEffect(() => {
		void refreshActiveRuns()
	}, [refreshActiveRuns])

	useInterval(() => void refreshActiveRuns(), RUNS_POLL_INTERVAL_MS, activeRuns.length > 0)

	if (!runs.length) {
		return (
			<PageState
				icon={<Pipeline />}
				title="No runs started from this browser"
				description="Upload a dataset to start a pipeline run. Its progress shows up here."
				actions={
					<ButtonLink to={UPLOAD_PATH} type="primary">
						Upload a dataset
					</ButtonLink>
				}
			/>
		)
	}

	return (
		<>
			<Styled.Panel as="ul">
				{runs.map((run) => (
					<Styled.RunRow key={run.dagRunId}>
						<Styled.RunMain>
							{run.state === 'success' ? (
								<Styled.RunFile to={getDashboardPath(run.filename)}>{run.filename}</Styled.RunFile>
							) : (
								<Styled.RunFileText>{run.filename}</Styled.RunFileText>
							)}
							<Styled.DagMeta>
								<code title={run.dagRunId}>{run.dagRunId}</code>
								<span>{formatRelative(run.queuedAt)}</span>
							</Styled.DagMeta>
							{run.errorMessage && <Styled.RunError>{run.errorMessage}</Styled.RunError>}
						</Styled.RunMain>
						<StatusBadge state={run.state} />
					</Styled.RunRow>
				))}
			</Styled.Panel>
			<Styled.ClearButton type="link" onClick={clear}>
				Clear list
			</Styled.ClearButton>
		</>
	)
})

export const PipelinesPage = () => {
	const [store] = useState(() => new PipelinesPageStore())

	useEffect(() => {
		void store.fetchDagList()
	}, [store])

	return (
		<Styled.PipelinesPage>
			<Styled.Section aria-labelledby="pipelines-title">
				<Styled.SectionHeader>
					<Styled.SectionTitle id="pipelines-title">Airflow pipelines</Styled.SectionTitle>
					<Styled.SectionDescription>
						DAGs registered in Airflow and whether they accept runs.
					</Styled.SectionDescription>
				</Styled.SectionHeader>
				<DagList store={store} />
			</Styled.Section>
			<Styled.Section aria-labelledby="runs-title">
				<Styled.SectionHeader>
					<Styled.SectionTitle id="runs-title">Recent runs</Styled.SectionTitle>
					<Styled.SectionDescription>
						Runs started from this browser. The console API doesn’t list run history, so runs started
						elsewhere aren’t shown.
					</Styled.SectionDescription>
				</Styled.SectionHeader>
				<RecentRuns />
			</Styled.Section>
		</Styled.PipelinesPage>
	)
}
