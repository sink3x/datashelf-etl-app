/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_MOCK?: string
	readonly VITE_BASE_PATH?: string
	readonly VITE_REACT_HOST?: string
	readonly VITE_REACT_PORT?: string
	readonly VITE_REACT_USE_STRICT_MODE?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
