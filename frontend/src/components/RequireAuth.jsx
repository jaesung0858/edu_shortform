import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../api/auth'

export default function RequireAuth({ children }) {
  const location = useLocation()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true

    getCurrentUser()
      .then((user) => {
        if (!active) return
        const hasSession = user
          && typeof user === 'object'
          && typeof user.email === 'string'
          && user.email.length > 0
          && user.userId !== null
          && user.userId !== undefined
        setStatus(hasSession ? 'authenticated' : 'unauthenticated')
      })
      .catch((error) => {
        if (!active) return
        setStatus(error.response?.status === 401 ? 'unauthenticated' : 'error')
      })

    return () => { active = false }
  }, [])

  if (status === 'loading') {
    return <p role="status">로그인 상태를 확인하고 있습니다.</p>
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname, search: location.search } }}
      />
    )
  }

  if (status === 'error') {
    return <p role="alert">회원 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.</p>
  }

  return children
}
