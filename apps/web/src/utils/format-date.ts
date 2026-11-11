import { DateTime } from 'luxon'

export const formatDateTime = (isoDate: string, locale: string) => {
	const date = DateTime.fromISO(isoDate, { zone: 'utc' }).setZone('local').setLocale(locale)

	return date.isValid ? date.toLocaleString(DateTime.DATETIME_MED) : isoDate
}

export const formatRelativeTime = (isoDate: string, locale: string) =>
	DateTime.fromISO(isoDate).setLocale(locale).toRelative() ?? isoDate
