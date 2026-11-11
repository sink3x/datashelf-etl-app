import { useEffect, useState } from 'react'

import { Pipeline, TriangleExclamation } from '@gravity-ui/icons'
import { Skeleton } from 'antd'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

import { getDashboardPath, ROUTE_PATHS } from '@router/paths'
import { runsStore } from '@stores/runs-store'
import { Button } from '@ui/Button/Button'
import { ButtonLink } from '@ui/ButtonLink/ButtonLink'

import { PageState } from '@components/PageState/PageState'
import { StatusBadge } from '@components/StatusBadge/StatusBadge'
import { useInterval } from '@hooks/use-interval'
import { useLanguage } from '@hooks/use-language'
import type { IDag } from '@interfaces/dag'
import { formatRelativeTime } from '@utils/format-date'
import { getAxiosError } from '@utils/get-axios-error/get-axios-error'

import { PipelinesPageStore } from './PipelinesPage.store'
import * as Styled from './PipelinesPage.styles'

const UPLOAD_PATH = ROUTE_PATHS.CONSOLE_UPLOAD

const RUNS_POLL_INTERVAL_MS = 5000

const getDagStatus = (dag: IDag) => {
	if (dag.has_import_errors) {
		return { labelKey: 'importErrors', tone: 'danger' } as const
	}

	if (dag.is_paused) {
		return { labelKey: 'paused', tone: 'muted' } as const
	}

	return { labelKey: 'active', tone: 'success' } as const
}

const DagList = observer(({ store }: { store: PipelinesPageStore }) => {
	const { dagList, isLoading, error, fetchDagList } = store

	const errorMessage = error ? getAxiosError(error) : null

	const { t } = useTranslation()

	if (isLoading) {
		return (
			<Styled.Panel aria-busy="true" aria-label={t('pipelines.loading')}>
				<Skeleton active title={false} paragraph={{ rows: 3 }} />
			</Styled.Panel>
		)
	}

	if (errorMessage) {
		return (
			<PageState
				tone="error"
				icon={<TriangleExclamation />}
				title={t('pipelines.loadError')}
				description={errorMessage}
				actions={
					<Button type="primary" onClick={() => void fetchDagList()}>
						{t('common.tryAgain')}
					</Button>
				}
			/>
		)
	}

	if (!dagList.length) {
		return (
			<PageState
				icon={<Pipeline />}
				title={t('pipelines.emptyTitle')}
				description={t('pipelines.emptyDescription')}
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
								{schedule && <span>{t('pipelines.schedule', { schedule })}</span>}
								{dag.tags?.map((tag) => <Styled.Tag key={tag.name}>{tag.name}</Styled.Tag>)}
							</Styled.DagMeta>
						</Styled.DagMain>
						<Styled.DagStatus $tone={status.tone}>
							{t(`pipelines.status.${status.labelKey}`)}
						</Styled.DagStatus>
					</Styled.DagRow>
				)
			})}
		</Styled.Panel>
	)
})

const RecentRuns = observer(() => {
	const { runs, activeRuns, refreshActiveRuns, clear } = runsStore

	const { t } = useTranslation()
	const { intlLocale } = useLanguage()

	useEffect(() => {
		void refreshActiveRuns()
	}, [refreshActiveRuns])

	useInterval(() => void refreshActiveRuns(), RUNS_POLL_INTERVAL_MS, activeRuns.length > 0)

	if (!runs.length) {
		return (
			<PageState
				icon={<Pipeline />}
				title={t('pipelines.noRunsTitle')}
				description={t('pipelines.noRunsDescription')}
				actions={
					<ButtonLink to={UPLOAD_PATH} type="primary">
						{t('common.uploadDataset')}
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
								<span>{formatRelativeTime(run.queuedAt, intlLocale)}</span>
							</Styled.DagMeta>
							{run.errorMessage && <Styled.RunError>{run.errorMessage}</Styled.RunError>}
						</Styled.RunMain>
						<StatusBadge state={run.state} />
					</Styled.RunRow>
				))}
			</Styled.Panel>
			<Styled.ClearButton type="link" onClick={clear}>
				{t('pipelines.clearList')}
			</Styled.ClearButton>
		</>
	)
})

export const PipelinesPage = () => {
	const [store] = useState(() => new PipelinesPageStore())
	const { t } = useTranslation()

	useEffect(() => {
		void store.fetchDagList()
	}, [store])

	return (
		<Styled.PipelinesPage>
			<Styled.Section aria-labelledby="pipelines-title">
				<Styled.SectionHeader>
					<Styled.SectionTitle id="pipelines-title">{t('pipelines.dagsTitle')}</Styled.SectionTitle>
					<Styled.SectionDescription>{t('pipelines.dagsDescription')}</Styled.SectionDescription>
				</Styled.SectionHeader>
				<DagList store={store} />
			</Styled.Section>
			<Styled.Section aria-labelledby="runs-title">
				<Styled.SectionHeader>
					<Styled.SectionTitle id="runs-title">{t('pipelines.runsTitle')}</Styled.SectionTitle>
					<Styled.SectionDescription>{t('pipelines.runsDescription')}</Styled.SectionDescription>
				</Styled.SectionHeader>
				<RecentRuns />
			</Styled.Section>
		</Styled.PipelinesPage>
	)
}
