import type { IDatasetProcessed } from '@interfaces/dataset-processed'
import type { TMaybe } from '@interfaces/maybe'

export const aggregateChartList = (datasetList: IDatasetProcessed[]) => {
  const aggregatedChartList = datasetList.reduce(
    (accumulator, document) => {
      const { chart } = document

      if (chart && typeof chart === 'object') {
        const isNestedChartList = Array.isArray(chart)

        if (isNestedChartList) {
          chart.forEach((chartObject) => {
            accumulator[chartObject?.name] = accumulator[chartObject?.name] || []
            accumulator[chartObject?.name].push(chartObject)
          })
        } else {
          const chartName: TMaybe<string> = document?.chart?.name

          if (!chartName) {
            return accumulator
          }
          accumulator[chartName] = accumulator[chartName] || []

          accumulator[chartName].push(chart)
        }
      }

      return accumulator
    },
    {} as Record<string, IDatasetProcessed['chart'][]>,
  )

  return aggregatedChartList
}
