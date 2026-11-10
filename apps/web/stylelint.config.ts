export default {
	extends: ['stylelint-config-standard'],
	overrides: [
		{
			files: ['**/*.styles.{ts,tsx}'],
			customSyntax: 'postcss-styled-syntax',
		},
	],
	rules: {
		'block-no-empty': true,
		'color-no-invalid-hex': true,
	},
}
