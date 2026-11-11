import path from 'path'

const UNSAFE_CHARACTERS = /[^A-Za-z0-9._-]+/g
const MAX_BASENAME_LENGTH = 100

export const buildRawObjectKey = (prefix: string, originalName: string, now: Date) => {
  const extension = path.extname(originalName).replace(UNSAFE_CHARACTERS, '').toLowerCase()
  const baseName =
    path
      .basename(originalName, path.extname(originalName))
      .replace(UNSAFE_CHARACTERS, '_')
      .replace(/^[._]+/, '')
      .slice(0, MAX_BASENAME_LENGTH) || 'dataset'
  const timestamp = Math.floor(now.getTime() / 1000)

  return `${prefix}/${baseName}-${timestamp}${extension}`
}
