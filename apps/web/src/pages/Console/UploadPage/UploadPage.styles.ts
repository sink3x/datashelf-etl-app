import styled from 'styled-components'

import { colors, fonts, fontSizes, radii, space } from '@styles/tokens'

export const UploadPage = styled.div`
	width: 100%;
	max-width: 720px;
	display: flex;
	flex-direction: column;
	gap: ${space(4)};

	code {
		font-family: ${fonts.mono};
		font-size: 0.92em;
	}
`

export const Intro = styled.p`
	margin: 0;
	max-width: 64ch;
	color: ${colors.inkMuted};
	font-size: ${fontSizes.md};
	line-height: 1.6;
`

export const DropzoneBody = styled.div`
	padding: ${space(6)} ${space(4)};
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: ${space(2)};
`

export const DropzoneIcon = styled.span`
	width: 48px;
	height: 48px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: ${radii.md};
	background: ${colors.accentSoft};
	color: ${colors.accent};

	svg {
		width: 24px;
		height: 24px;
	}
`

export const DropzoneTitle = styled.span`
	color: ${colors.ink};
	font-size: ${fontSizes.lg};
	font-weight: 600;
`

export const DropzoneHint = styled.span`
	color: ${colors.inkMuted};
	font-size: ${fontSizes.sm};
`

export const SelectedFile = styled.div`
	padding: ${space(3)} ${space(4)};
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	gap: ${space(1)} ${space(3)};
	align-items: center;
	border: 1px solid ${colors.line};
	border-radius: ${radii.md};
	background: ${colors.surface};
`

export const SelectedFileIcon = styled.span`
	display: inline-flex;
	color: ${colors.accent};
`

export const SelectedFileName = styled.span`
	overflow: hidden;
	font-family: ${fonts.mono};
	font-size: ${fontSizes.sm};
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const SelectedFileSize = styled.span`
	color: ${colors.inkMuted};
	font-size: ${fontSizes.sm};
	font-variant-numeric: tabular-nums;
`

export const SelectedFileProgress = styled.div`
	grid-column: 1 / -1;
`

export const InlineError = styled.p`
	margin: 0;
	padding: ${space(3)} ${space(4)};
	display: flex;
	gap: ${space(2)};
	align-items: center;
	border-radius: ${radii.md};
	background: ${colors.dangerSoft};
	color: ${colors.danger};
	font-size: ${fontSizes.md};

	svg {
		flex: none;
	}
`

export const Panel = styled.section`
	padding: ${space(6)};
	display: flex;
	flex-direction: column;
	gap: ${space(6)};
	border: 1px solid ${colors.line};
	border-radius: ${radii.lg};
	background: ${colors.surface};
`

export const PanelHeader = styled.header`
	display: flex;
	flex-wrap: wrap;
	gap: ${space(3)};
	align-items: flex-start;
	justify-content: space-between;
`

export const PanelTitle = styled.h2`
	margin: 0 0 ${space(1)};
	color: ${colors.ink};
	font-size: ${fontSizes.lg};
	font-weight: 600;
	overflow-wrap: anywhere;
`

export const PanelText = styled.p`
	margin: 0;
	color: ${colors.inkMuted};
	font-size: ${fontSizes.sm};
	overflow-wrap: anywhere;
`

export const PanelActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: ${space(2)};
`
