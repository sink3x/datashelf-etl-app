export const USE_STRICT_MODE = import.meta.env.VITE_REACT_USE_STRICT_MODE === 'true'
export const IS_API_MOCK = import.meta.env.VITE_API_MOCK === 'true'
export const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'
