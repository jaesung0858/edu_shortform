import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser, logout as requestLogout } from '../api/auth'
import { AuthSessionContext } from './AuthSessionContext'

function isUser(value) {
  return value
    && typeof value === 'object'
    && typeof value.email === 'string'
    && value.email.length > 0
    && value.userId !== null
    && value.userId !== undefined
}

export function AuthSessionProvider({ children }) {
  const [session, setSession] = useState({ loading: true, user: null, error: '' })

  const readSession = useCallback(async () => {
    try {
      const user = await getCurrentUser()
      return isUser(user)
        ? { user, error: '' }
        : { user: null, error: '' }
    } catch (error) {
      const unauthenticated = error.response?.status === 401
      return {
        user: null,
        error: unauthenticated
          ? ''
          : '회원 정보를 불러오지 못했습니다. 서버 연결을 확인해주세요.',
      }
    }
  }, [])

  const refreshSession = useCallback(async () => {
    setSession(previous => ({ ...previous, loading: true, error: '' }))
    const result = await readSession()
    setSession({ loading: false, ...result })
    return result.user
  }, [readSession])

  const logout = useCallback(async () => {
    await requestLogout()
    setSession({ loading: false, user: null, error: '' })
  }, [])

  useEffect(() => {
    let active = true
    readSession().then(result => {
      if (active) setSession({ loading: false, ...result })
    })
    return () => { active = false }
  }, [readSession])

  return (
    <AuthSessionContext.Provider value={{ session, refreshSession, logout }}>
      {children}
    </AuthSessionContext.Provider>
  )
}
