import { useState } from 'react'

import { FileArrowUp } from '@gravity-ui/icons'
import { Button, Upload } from 'antd'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { ERoutesPageNames, Routes } from '@router/routes'

import { uploadRawData } from '@services/airflow-service/airflow-service'
import { APP_CONFIG } from '@shared/config/config'

import {
	ALLOWLABLE_FILE_TYPE_LIST,
	uploadButtonLabelAcceptedfileList,
	uploadFormAcceptedFileTypeList,
} from './UploadPage.constants'
import * as Styled from './UploadPage.styles'

import type { AxiosError } from 'axios'

const { vars } = APP_CONFIG

export const UploadPage = () => {
	const navigate = useNavigate()

	const [file, setFile] = useState<File | null>(null)
	const [isUploading, setIsUploading] = useState(false)

	const handleBeforeUpload = (file: File) => {
		const isCsvOrJson = ALLOWLABLE_FILE_TYPE_LIST.includes(file.type)

		if (!isCsvOrJson) {
			toast.error(`Allowed only ${uploadFormAcceptedFileTypeList.join(', ')} files`)

			return Upload.LIST_IGNORE
		}

		setFile(file)

		return false
	}

	const handleUpload = async () => {
		if (!file) {
			return
		}

		const formData = new FormData()

		formData.append('file', file)
		formData.append('dagId', vars.defaultDagId)

		try {
			setIsUploading(true)

			await uploadRawData(formData, {
				onUploadProgress: (_progressEvent: ProgressEvent) => {
					// TODO: emplement show progess
				},
			})

			toast.success('File succesfull uploaded and sended to process')
			navigate(Routes[ERoutesPageNames.CONSOLE]!.children!.CONSOLE_FILES!.fullPath!)
		} catch (error) {
			const cathedError = error as AxiosError<{ message: string }> | Error
			const message = 'response' in cathedError ? cathedError?.response?.data?.message : cathedError?.message

			toast.error(message)
		} finally {
			setIsUploading(false)
		}
	}

	return (
		<Styled.UploadPageSpaceContainer>
			<Upload
				beforeUpload={handleBeforeUpload}
				maxCount={1}
				accept={uploadFormAcceptedFileTypeList.join(',')}
			>
				<Button icon={<FileArrowUp />}>Select file ({uploadButtonLabelAcceptedfileList.join('/')})</Button>
			</Upload>
			<Styled.UploadRawDataButton
				type="primary"
				onClick={handleUpload}
				disabled={!file}
				loading={isUploading}
			>
				Process data
			</Styled.UploadRawDataButton>
		</Styled.UploadPageSpaceContainer>
	)
}
