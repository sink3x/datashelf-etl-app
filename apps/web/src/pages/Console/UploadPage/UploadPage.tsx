import { useState } from 'react'

import { CloudArrowUpIn, File as FileIcon, TriangleExclamation } from '@gravity-ui/icons'
import { Progress, Steps, Upload, type UploadProps } from 'antd'
import { observer } from 'mobx-react-lite'

import { ERoutesPageNames, Routes } from '@router/routes'
import { isTerminalRunState, runsStore } from '@stores/runs-store'
import { Button } from '@ui/Button/Button'
import { ButtonLink } from '@ui/ButtonLink/ButtonLink'

import { StatusBadge } from '@components/StatusBadge/StatusBadge'
import { useInterval } from '@hooks/use-interval'
import type { TDagRunState } from '@interfaces/dag'
import { uploadRawData } from '@services/airflow-service/airflow-service'
import { getAppConfig } from '@shared/config/config'
import { convertFileSize } from '@utils/convert-file-size'
import { getAxiosError } from '@utils/get-axios-error/get-axios-error'

import { ALLOWED_FILE_EXTENSIONS, isAllowedFile, RUN_POLL_INTERVAL_MS } from './UploadPage.constants'
import * as Styled from './UploadPage.styles'

const consoleRoutes = Routes[ERoutesPageNames.CONSOLE]!.children!
const getDashboardPath = consoleRoutes[ERoutesPageNames.CONSOLE_DASHBOARD_BY_FILENAME]!.getFullPathDynamic!
const PIPELINES_PATH = consoleRoutes[ERoutesPageNames.CONSOLE_PIPELINES]!.fullPath!

const RUN_STEP_INDEX: Record<TDagRunState, number> = {
	queued: 1,
	running: 2,
	success: 3,
	failed: 2,
}

export const UploadPage = observer(() => {
	const { vars } = getAppConfig()

	const [file, setFile] = useState<File | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [runId, setRunId] = useState<string | null>(null)

	const run = runId ? runsStore.getRun(runId) : undefined
	const isRunActive = Boolean(run && !isTerminalRunState(run.state))

	useInterval(
		() => {
			if (runId) {
				void runsStore.refreshRun(runId)
			}
		},
		RUN_POLL_INTERVAL_MS,
		isRunActive,
	)

	const handleBeforeUpload: UploadProps['beforeUpload'] = (selectedFile) => {
		if (!isAllowedFile(selectedFile)) {
			setErrorMessage(
				`${selectedFile.name} isn’t supported. Choose a ${ALLOWED_FILE_EXTENSIONS.join(' or ')} file.`,
			)

			return Upload.LIST_IGNORE
		}

		setFile(selectedFile)
		setErrorMessage(null)

		return false
	}

	const handleUpload = async () => {
		if (!file) {
			return
		}

		setIsUploading(true)
		setUploadProgress(0)
		setErrorMessage(null)

		try {
			const { triggeredDagInfo } = await uploadRawData({
				file,
				dagId: vars.defaultDagId,
				onProgress: setUploadProgress,
			})

			if (triggeredDagInfo) {
				setRunId(runsStore.trackRun(triggeredDagInfo, file.name).dagRunId)
			}
		} catch (error) {
			setErrorMessage(getAxiosError(error))
		} finally {
			setIsUploading(false)
		}
	}

	const handleReset = () => {
		setFile(null)
		setRunId(null)
		setErrorMessage(null)
		setUploadProgress(0)
	}

	if (run) {
		const isFailed = run.state === 'failed'

		return (
			<Styled.UploadPage>
				<Styled.Panel aria-live="polite">
					<Styled.PanelHeader>
						<div>
							<Styled.PanelTitle>Processing {run.filename}</Styled.PanelTitle>
							<Styled.PanelText>
								Pipeline <code>{run.dagId}</code>, run <code>{run.dagRunId}</code>
							</Styled.PanelText>
						</div>
						<StatusBadge state={run.state} />
					</Styled.PanelHeader>
					<Steps
						responsive
						current={RUN_STEP_INDEX[run.state]}
						status={isFailed ? 'error' : run.state === 'success' ? 'finish' : 'process'}
						items={[
							{ title: 'Uploaded' },
							{ title: 'Queued' },
							{ title: isFailed ? 'Failed' : 'Running' },
							{ title: 'Charts ready' },
						]}
					/>
					{run.errorMessage && <Styled.InlineError role="alert">{run.errorMessage}</Styled.InlineError>}
					<Styled.PanelActions>
						{run.state === 'success' && (
							<ButtonLink to={getDashboardPath(run.filename)} type="primary">
								Open dashboard
							</ButtonLink>
						)}
						{isFailed && (
							<ButtonLink to={PIPELINES_PATH} type="primary">
								View pipelines
							</ButtonLink>
						)}
						<Button onClick={handleReset}>Upload another file</Button>
					</Styled.PanelActions>
				</Styled.Panel>
			</Styled.UploadPage>
		)
	}

	return (
		<Styled.UploadPage>
			<Styled.Intro>
				Upload a retail dataset to store it and start the <code>{vars.defaultDagId}</code> pipeline. When the
				run finishes, its charts appear on the file’s dashboard.
			</Styled.Intro>
			<Upload.Dragger
				accept={ALLOWED_FILE_EXTENSIONS.join(',')}
				beforeUpload={handleBeforeUpload}
				maxCount={1}
				showUploadList={false}
				disabled={isUploading}
			>
				<Styled.DropzoneBody>
					<Styled.DropzoneIcon aria-hidden>
						<CloudArrowUpIn />
					</Styled.DropzoneIcon>
					<Styled.DropzoneTitle>Drop a file here or click to choose one</Styled.DropzoneTitle>
					<Styled.DropzoneHint>CSV or JSON, one file per run</Styled.DropzoneHint>
				</Styled.DropzoneBody>
			</Upload.Dragger>
			{file && (
				<Styled.SelectedFile>
					<Styled.SelectedFileIcon aria-hidden>
						<FileIcon />
					</Styled.SelectedFileIcon>
					<Styled.SelectedFileName title={file.name}>{file.name}</Styled.SelectedFileName>
					<Styled.SelectedFileSize>{convertFileSize(file.size)}</Styled.SelectedFileSize>
					{isUploading && (
						<Styled.SelectedFileProgress>
							<Progress percent={uploadProgress} size="small" aria-label="Upload progress" />
						</Styled.SelectedFileProgress>
					)}
				</Styled.SelectedFile>
			)}
			{errorMessage && (
				<Styled.InlineError role="alert">
					<TriangleExclamation aria-hidden />
					{errorMessage}
				</Styled.InlineError>
			)}
			<Styled.PanelActions>
				<Button type="primary" onClick={handleUpload} disabled={!file} loading={isUploading}>
					Upload and process
				</Button>
				{file && !isUploading && <Button onClick={handleReset}>Clear</Button>}
			</Styled.PanelActions>
		</Styled.UploadPage>
	)
})
