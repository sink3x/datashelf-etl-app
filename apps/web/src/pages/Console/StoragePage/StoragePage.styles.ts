import { Pagination } from 'antd'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { colors, focusRing, fonts, fontSizes, radii, space } from '@styles/tokens'

export const StoragePage = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: ${space(6)};
`

export const Toolbar = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: ${space(3)};
	align-items: center;
	justify-content: space-between;
`

export const ToolbarText = styled.p`
	margin: 0;
	color: ${colors.inkMuted};
	font-size: ${fontSizes.md};
`

export const ToolbarActions = styled.div`
	display: flex;
	gap: ${space(2)};
`

export const FileGrid = styled.ul`
	margin: 0;
	padding: 0;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	gap: ${space(3)};
	list-style: none;
`

export const FileCard = styled(Link)`
	height: 100%;
	padding: ${space(4)};
	display: grid;
	grid-template-columns: auto minmax(0, 1fr);
	gap: ${space(1)} ${space(3)};
	align-items: center;
	border: 1px solid ${colors.line};
	border-radius: ${radii.md};
	background: ${colors.surface};
	color: ${colors.ink};
	transition: border-color 0.15s ease;

	&:hover {
		border-color: ${colors.accent};
		color: ${colors.ink};
	}

	&:focus-visible {
		${focusRing}
	}
`

export const FileCardSkeleton = styled.li`
	padding: ${space(4)};
	border: 1px solid ${colors.line};
	border-radius: ${radii.md};
	background: ${colors.surface};
`

export const FileIcon = styled.span`
	width: 32px;
	height: 32px;
	grid-row: span 2;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: ${radii.sm};
	background: ${colors.accentSoft};
	color: ${colors.accent};
`

export const FileName = styled.span`
	overflow: hidden;
	font-family: ${fonts.mono};
	font-size: ${fontSizes.sm};
	font-weight: 500;
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const FileMeta = styled.span`
	display: flex;
	flex-wrap: wrap;
	gap: 0 ${space(3)};
	color: ${colors.inkMuted};
	font-size: ${fontSizes.xs};
	font-variant-numeric: tabular-nums;
`

export const StoragePagination = styled(Pagination)`
	align-self: flex-end;
`
