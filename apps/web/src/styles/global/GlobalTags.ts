import { createGlobalStyle } from 'styled-components'

import { colors, fonts } from '@styles/tokens'

export const GlobalStyleTags = createGlobalStyle`
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	html {
		height: 100%;
		scrollbar-color: ${colors.lineStrong} transparent;
		scrollbar-width: thin;
		text-size-adjust: 100%;
	}

	body {
		min-height: 100%;
		margin: 0;
		background-color: ${colors.canvas};
		color: ${colors.ink};
		font-family: ${fonts.sans};
		font-feature-settings: 'cv11', 'ss01';
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	#root {
		min-height: 100vh;
	}

	code {
		font-family: ${fonts.mono};
	}

	a {
		color: ${colors.accent};
		text-decoration: none;
	}

	a:focus-visible,
	button:focus-visible,
	[tabindex]:focus-visible {
		outline: 2px solid ${colors.accent};
		outline-offset: 2px;
	}

	::selection {
		color: ${colors.surface};
		background-color: ${colors.accent};
	}

	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
`
