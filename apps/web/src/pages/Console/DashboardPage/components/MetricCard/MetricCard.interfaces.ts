import type { IDatasetProcessed } from '@interfaces/dataset-processed'

import type { CardProps } from 'antd'

export interface IMetricCardProps extends CardProps {
	chartFormatted: IDatasetProcessed['chart']
}
