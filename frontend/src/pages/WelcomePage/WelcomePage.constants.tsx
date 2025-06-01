import { ChartColumn, DisplayPulse, Layers, ObjectAlignCenterHorizontal, Pipeline } from '@gravity-ui/icons'

export const WELCOME_TITLE = 'Technology in retail'

export const WELCOME_DESCRIPTION =
	'Dashboard application designed to orchestrate, monitor, and visualize retail data.'

export const CASE_ITEM_LIST = [
	{
		icon: <ChartColumn />,
		title: 'Data Visualization',
		description:
			'Display processed ETL data in interactive charts and dashboards for better decision-making.',
	},
	{
		icon: <Pipeline />,
		title: 'Custom ETL Pipelines',
		description:
			'Integrate and monitor your own extraction, transformation, and loading logic with full control.',
	},
	{
		icon: <DisplayPulse />,
		title: 'Real-Time Monitoring',
		description: 'Track the live status of each ETL job with logs, metrics, and health indicators.',
	},
	{
		icon: <ObjectAlignCenterHorizontal />,
		title: 'Control',
		description: 'Manage and orchestrate the entire data flow from a single unified interface.',
	},
	{
		icon: <Layers />,
		title: 'Monolithic Architecture',
		description: 'Simplified structure ensures transparency, fast onboarding, and easy deployment.',
	},
]
