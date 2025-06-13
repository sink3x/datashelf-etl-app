export interface CitySalesValue {
	city: string
	saleSum: number
}

export interface IGeographMapProps {
	values: CitySalesValue[]
}

export interface IGeographMapColoredProps {
	$glowColor: string
}
