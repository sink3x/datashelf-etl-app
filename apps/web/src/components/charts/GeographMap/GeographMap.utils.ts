import { scaleQuantize } from 'd3-scale'

import { mapScale } from '@styles/tokens'

import type { ICitySales } from '../chart-adapters'

import { CITY_STATE_ID_MAP } from './GeographMap.constants'

export const getColorScale = (maxSale: number) =>
	scaleQuantize<string>()
		.domain([0, Math.max(maxSale, 1)])
		.range(mapScale)

export const aggregateSalesByState = (values: ICitySales[]) => {
	const salesByState = new Map<string, number>()
	const citiesByState = new Map<string, string[]>()

	values.forEach(({ city, saleSum }) => {
		const stateId = CITY_STATE_ID_MAP[city]

		if (!stateId) {
			return
		}

		salesByState.set(stateId, (salesByState.get(stateId) ?? 0) + saleSum)

		const cities = citiesByState.get(stateId) ?? []

		if (!cities.includes(city)) {
			citiesByState.set(stateId, [...cities, city])
		}
	})

	return { salesByState, citiesByState }
}
