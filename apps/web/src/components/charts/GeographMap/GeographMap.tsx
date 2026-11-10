import { useMemo, type FC } from 'react'

import { ComposableMap, Geographies } from 'react-simple-maps'
import { Tooltip } from 'react-tooltip'

import { getAppConfig } from '@shared/config/config'
import { colors } from '@styles/tokens'
import { formatFullNumber } from '@utils/format-number'

import 'react-tooltip/dist/react-tooltip.css'

import * as Styled from './GeographMap.styles'
import { aggregateSalesByState, getColorScale } from './GeographMap.utils'

import type { IGeographMapProps } from './GeographMap.interfaces'

const TOOLTIP_ID = 'state-sales-tooltip'

const getStateTooltip = (stateName: string, sales: number, cities: string[]) =>
	sales
		? `${stateName}: ${formatFullNumber(sales)} in sales (${cities.join(', ')})`
		: `${stateName}: no sales`

export const GeographMap: FC<IGeographMapProps> = (props) => {
	const { values } = props

	const { urls } = getAppConfig()

	const { salesByState, citiesByState } = useMemo(() => aggregateSalesByState(values), [values])
	const colorScale = useMemo(() => getColorScale(Math.max(0, ...salesByState.values())), [salesByState])

	return (
		<Styled.MapContainer>
			<ComposableMap projection="geoAlbersUsa" width={800} height={480}>
				<Geographies geography={urls.geographyAtlasUrl}>
					{({ geographies }) =>
						geographies.map((geo) => {
							const stateId = String(geo.id)
							const sales = salesByState.get(stateId) ?? 0

							return (
								<Styled.State
									key={geo.rsmKey}
									geography={geo}
									fill={sales ? colorScale(sales) : colors.surfaceSunken}
									stroke={colors.lineStrong}
									strokeWidth={0.6}
									data-tooltip-id={TOOLTIP_ID}
									data-tooltip-content={getStateTooltip(
										String(geo.properties?.name ?? ''),
										sales,
										citiesByState.get(stateId) ?? [],
									)}
								/>
							)
						})
					}
				</Geographies>
			</ComposableMap>
			<Tooltip id={TOOLTIP_ID} />
		</Styled.MapContainer>
	)
}
