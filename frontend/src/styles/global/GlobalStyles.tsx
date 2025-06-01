import { Normalize } from 'styled-normalize'

import { GlobalStyleTags } from './global-tags'

import '@fontsource-variable/fira-code'
import '@fontsource-variable/inter'

export const GlobalStyles = () => (
	<>
		<Normalize />
		<GlobalStyleTags />
	</>
)
