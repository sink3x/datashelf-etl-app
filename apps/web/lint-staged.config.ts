export default {
	'**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write', 'stylelint --fix'],
	'**/*.{json,md}': ['prettier --write'],
}
