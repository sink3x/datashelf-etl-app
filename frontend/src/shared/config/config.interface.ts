export interface IAppConfig {
	services: {
		apiUrl: string
	}
	urls: {
		contactUsUrl: string
		documentationUrl: string
		georaphyAtlasUrl: string
	}
	vars: {
		axiosCacheLifetimeInSec: number
	}
}
