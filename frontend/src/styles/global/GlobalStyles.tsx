import { Normalize } from 'styled-normalize'

import { GlobalStyleTags } from './GlobalTags'

import '@fontsource-variable/fira-code'
import '@fontsource-variable/inter'

export const GlobalStyles = () => (
	<>
		<Normalize />
		<GlobalStyleTags />
	</>
)
