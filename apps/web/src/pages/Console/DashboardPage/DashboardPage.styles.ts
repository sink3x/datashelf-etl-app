import styled, { keyframes } from 'styled-components'

import { colors, fonts, fontSizes, media, radii, space } from '@styles/tokens'

export const Toolbar = styled.div`
	width: 100%;
	margin-bottom: ${space(6)};
	display: flex;
	gap: ${space(3)};
	align-items: center;
	justify-content: space-between;
`

export const FileInfo = styled.div`
	min-width: 0;
	display: flex;
	flex-wrap: wrap;
	gap: ${space(1)} ${space(3)};
	align-items: baseline;
`

export const FileName = styled.code`
	max-width: 100%;
	overflow: hidden;
	color: ${colors.ink};
	font-family: ${fonts.mono};
	font-size: ${fontSizes.md};
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const FileMeta = styled.span`
	color: ${colors.inkMuted};
	font-size: ${fontSizes.sm};
`

export const Page = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: ${space(10)};
`

export const MetricStrip = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
	overflow: hidden;
	border: 1px solid ${colors.line};
	border-radius: ${radii.lg};
	background: ${colors.surface};

	& > * {
		margin: -1px 0 0 -1px;
		border-top: 1px solid ${colors.line};
		border-left: 1px solid ${colors.line};
		border-radius: 0;
	}
`

export const Section = styled.section`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: ${space(4)};
`

export const SectionHeader = styled.header`
	padding-bottom: ${space(3)};
	border-bottom: 1px solid ${colors.line};
`

export const SectionTitle = styled.h2`
	margin: 0;
	color: ${colors.ink};
	font-size: ${fontSizes.xl};
	font-weight: 650;
	letter-spacing: -0.01em;
`

export const SectionDescription = styled.p`
	margin: ${space(1)} 0 0;
	color: ${colors.inkMuted};
	font-size: ${fontSizes.md};
`

export const ChartGrid = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: ${space(4)};

	${media.belowLg} {
		grid-template-columns: minmax(0, 1fr);
	}
`

const shimmer = keyframes`
	from {
		background-position: 100% 0;
	}

	to {
		background-position: -100% 0;
	}
`

export const SkeletonBlock = styled.div<{ $height: number; $isWide?: boolean }>`
	height: ${({ $height }) => $height}px;
	grid-column: ${({ $isWide }) => ($isWide ? 'span 2' : 'span 1')};
	border-radius: ${radii.lg};
	background: linear-gradient(
		90deg,
		${colors.surface} 25%,
		${colors.surfaceSunken} 50%,
		${colors.surface} 75%
	);
	background-size: 200% 100%;
	animation: ${shimmer} 1.4s linear infinite;

	${media.belowLg} {
		grid-column: span 1;
	}

	@media (prefers-reduced-motion: reduce) {
		animation: none;
	}
`
