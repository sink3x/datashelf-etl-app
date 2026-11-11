import { useEffect, useRef } from 'react'

export const useInterval = (callback: () => void, delayMs: number, isEnabled = true) => {
	const callbackRef = useRef(callback)

	useEffect(() => {
		callbackRef.current = callback
	}, [callback])

	useEffect(() => {
		if (!isEnabled) {
			return
		}

		const intervalId = window.setInterval(() => callbackRef.current(), delayMs)

		return () => window.clearInterval(intervalId)
	}, [delayMs, isEnabled])
}
