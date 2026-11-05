import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthSession } from '../auth/useAuthSession'

export default function RequireAdmin() {
  const location = useLocation()
  const { session } = useAuthSession()

  if (session.loading) {
    return <p role="status">{'\uC138\uC158\uACFC \uAD8C\uD55C\uC744 \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.'}</p>
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

  if (session.user.role !== 'ADMIN') {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}
