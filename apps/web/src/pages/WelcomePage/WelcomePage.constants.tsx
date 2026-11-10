import { ChartColumn, DisplayPulse, FolderArrowUpIn, Pipeline } from '@gravity-ui/icons'

export const WELCOME_TITLE = 'From raw retail data to a dashboard in one upload'

export const WELCOME_DESCRIPTION =
	'Datashelf stores your transactions file, runs an Airflow ETL pipeline on it and turns the results into sales, customer and seasonal charts.'

export const CASE_ITEM_LIST = [
	{
		icon: <FolderArrowUpIn />,
		title: 'Upload',
		description: 'Drop a CSV or JSON export. The file lands in object storage and starts a pipeline run.',
	},
	{
		icon: <Pipeline />,
		title: 'Process',
		description: 'Airflow cleans the data and computes metrics, distributions and seasonal top products.',
	},
	{
		icon: <DisplayPulse />,
		title: 'Follow the run',
		description: 'Watch the run move from queued to finished without leaving the console.',
	},
	{
		icon: <ChartColumn />,
		title: 'Explore',
		description: 'Open the dashboard for any stored file and download each chart as an image.',
	},
]
