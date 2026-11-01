export const DEFAULT_POST_LOGIN_PATH = '/myChannel'

export function getPostLoginPath(from, origin = window.location.origin) {
  if (!from || typeof from !== 'object') return DEFAULT_POST_LOGIN_PATH

  const { pathname, search = '' } = from
  if (
    typeof pathname !== 'string'
    || !/^\/learn\/\d+$/.test(pathname)
    || typeof search !== 'string'
    || (search !== '' && !search.startsWith('?'))
    || search.includes('#')
  ) {
    return DEFAULT_POST_LOGIN_PATH
  }

  try {
    const destination = new URL(`${pathname}${search}`, origin)
    if (destination.origin !== origin) return DEFAULT_POST_LOGIN_PATH
    return `${destination.pathname}${destination.search}`
  } catch {
    return DEFAULT_POST_LOGIN_PATH
  }
}
