import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSession } from '../auth/useAuthSession'

export default function RequireAuth({ children }) {
  const location = useLocation()
  const { session } = useAuthSession()

  if (session.loading) {
    return <p role="status">로그인 상태를 확인하고 있습니다.</p>
  }

  if (session.error) {
    return <p role="alert">{session.error}</p>
  }

  if (!session.user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname, search: location.search } }}
      />
    )
  }

  return children
}
