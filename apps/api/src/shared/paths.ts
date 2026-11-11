import path from 'path'

declare const __BUNDLED__: boolean | undefined

const isBundled = typeof __BUNDLED__ !== 'undefined' && __BUNDLED__

// The bundle lives in build/ next to copied assets; in source mode they stay in the package tree.
export const PUBLIC_DIR = isBundled ? path.join(__dirname, 'public') : path.resolve(__dirname, '../../public')
export const OPENAPI_DIR = isBundled ? path.join(__dirname, 'openapi') : path.resolve(__dirname, '../routers')
