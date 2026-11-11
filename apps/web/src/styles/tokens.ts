export const colors = {
	ink: '#1b1a2e',
	inkMuted: '#55576b',
	inkSubtle: '#8b8da0',
	canvas: '#f4f5f8',
	surface: '#ffffff',
	surfaceSunken: '#f9f9fb',
	line: '#e3e4ec',
	lineStrong: '#cfd1dc',
	accent: '#4a42d2',
	accentHover: '#3b34b0',
	accentSoft: '#ecebfb',
	success: '#1f7a52',
	successSoft: '#e5f4ec',
	warning: '#9a5b00',
	warningSoft: '#fdf1dc',
	danger: '#b8322f',
	dangerSoft: '#fbe9e8',
} as const

export const chartPalette = [
	'#4a42d2',
	'#1f9e89',
	'#e08a2c',
	'#d0517a',
	'#5b8def',
	'#9a7b4f',
	'#7a7d91',
] as const

export const mapScale = [
	'#f1f0fc',
	'#dcd9f7',
	'#c3bef1',
	'#a49deb',
	'#857ce3',
	'#6a60da',
	'#4a42d2',
	'#3a33a8',
	'#2b267d',
]

export const fonts = {
	sans: "'Inter Variable', system-ui, -apple-system, 'Segoe UI', sans-serif",
	mono: "'Fira Code Variable', ui-monospace, 'SFMono-Regular', monospace",
} as const

export const fontSizes = {
	xs: '12px',
	sm: '13px',
	md: '14px',
	lg: '16px',
	xl: '20px',
	xxl: '28px',
	display: '40px',
} as const

export const radii = {
	sm: '6px',
	md: '10px',
	lg: '14px',
	pill: '999px',
} as const

export const space = (step: number) => `${step * 4}px`

export const breakpoints = {
	sm: 576,
	md: 768,
	lg: 992,
	xl: 1200,
} as const

export const media = {
	belowSm: `@media (max-width: ${breakpoints.sm - 1}px)`,
	belowMd: `@media (max-width: ${breakpoints.md - 1}px)`,
	belowLg: `@media (max-width: ${breakpoints.lg - 1}px)`,
	belowXl: `@media (max-width: ${breakpoints.xl - 1}px)`,
} as const

export const shadows = {
	raised: '0 1px 2px rgba(27, 26, 46, 0.06)',
	overlay: '0 12px 32px rgba(27, 26, 46, 0.14)',
} as const

export const focusRing = `outline: 2px solid ${colors.accent}; outline-offset: 2px;`
