export default {
	extends: ['stylelint-config-standard', 'stylelint-config-styled-components', 'stylelint-config-prettier'],
	customSyntax: '@stylelint/postcss-css-in-js',
	rules: {
		'at-rule-no-unknown': null,
		'block-no-empty': true,
		'color-no-invalid-hex': true,
		'declaration-block-trailing-semicolon': 'always',
		'no-descending-specificity': null,
	},
}
