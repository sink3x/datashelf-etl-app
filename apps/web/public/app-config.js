// Runtime configuration for local development.
// The production container regenerates this file from API_URL, DOCS_URL, CONTACT_URL and DEFAULT_DAG_ID.
window.appConfig = {
	services: {
		apiUrl: 'http://127.0.0.1:5000',
	},
	urls: {
		contactUsUrl: 'https://t.me/sink3x',
		documentationUrl: 'http://127.0.0.1:5000/docs',
	},
	vars: {
		defaultDagId: 'customer_data_etl',
	},
}
