import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from '../components/header'
import Sidebar from '../components/sidebar'
import { useAuthSession } from '../auth/useAuthSession'
import './layout.css'

function Layout({ sidebar = <Sidebar /> }) {
  const navigate = useNavigate()
  const { session, logout } = useAuthSession()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)

    try {
      await logout()
      setLogoutError('')
      navigate('/login', { replace: true })
    } catch {
      setLogoutError('로그아웃하지 못했습니다. 다시 시도해주세요.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="layout">
      <Header
        user={session.user}
        loading={session.loading}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />
      {(session.error || logoutError) && (
        <p role="alert" className="session-error">{logoutError || session.error}</p>
      )}
      <div className="layout-body">
        {sidebar}
        <main className="layout-main">
          <Outlet context={session} />
        </main>
      </div>
    </div>
  )
}

export default Layout
