import type { FC } from 'react'
import { useMemo } from 'react'

import { ComposableMap, Geographies } from 'react-simple-maps'
import { Tooltip } from 'react-tooltip'

import { APP_CONFIG } from '@shared/config/config'
import { EColorsMain } from '@styles/colors/colors-main'
import 'react-tooltip/dist/react-tooltip.css'

import { CITY_STATE_ID_MAP, colorGlowMap } from './GeographMap.constants'
import * as Styled from './GeographMap.styles'
import { getColorList } from './GeographMap.utils'

import type { IGeographMapProps } from './GeographMap.interfaces'

const { urls } = APP_CONFIG

export const GeographMap: FC<IGeographMapProps> = (props) => {
	const { values } = props

	const { stateSalesMap, stateCitiesMap } = useMemo(() => {
		const salesMap = new Map<string, number>()
		const citiesMap = new Map<string, string[]>()

		values.forEach(({ city, saleSum }) => {
			const stateId = CITY_STATE_ID_MAP[city]

			if (!stateId) {
				return
			}

			const prevSales = salesMap.get(stateId) || 0

			salesMap.set(stateId, prevSales + saleSum)

			const cities = citiesMap.get(stateId) || []

			if (!cities.includes(city)) {
				cities.push(city)
				citiesMap.set(stateId, cities)
			}
		})

		return {
			stateSalesMap: salesMap,
			stateCitiesMap: citiesMap,
		}
	}, [values])

	const maxSaleValue = Math.max(...stateSalesMap.values())

	return (
		<>
			<ComposableMap projection="geoAlbersUsa" width={800} height={500}>
				<Geographies geography={urls.georaphyAtlasUrl}>
					{({ geographies }) =>
						geographies.map((geo) => {
							const stateId = geo.id
							const name = geo.properties.name
							const saleList = stateSalesMap.get(stateId) || 0
							const cityList = stateCitiesMap.get(stateId) || []

							const fillColor = getColorList(maxSaleValue)(saleList)
							const tooltip = `${name}: ${saleList} sales ${cityList.length ? ` (${cityList.join(', ')})` : ''}`

							return (
								<Styled.GeographMapColored
									key={geo.rsmKey}
									geography={geo}
									fill={fillColor}
									data-tooltip-id="map-tooltip"
									data-tooltip-content={tooltip}
									stroke={EColorsMain.WHITE}
									$glowColor={colorGlowMap[fillColor] ?? 'rgba(24, 144, 255, 0.5)'}
								/>
							)
						})
					}
				</Geographies>
			</ComposableMap>
			<Tooltip id="map-tooltip" />
		</>
	)
}
