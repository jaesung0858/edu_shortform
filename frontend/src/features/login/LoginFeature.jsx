import { useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

export default function LoginFeature({ view = 'login' }) {
  const navigate = useNavigate()
  const onNavigate = (nextView) => navigate({
    login: '/login',
    signup: '/signup',
    forgot: '/forgot-password',
  }[nextView])

  if (view === 'signup') return <SignupPage onNavigate={onNavigate} />
  if (view === 'forgot') return <ForgotPasswordPage onNavigate={onNavigate} />
  return <LoginPage onNavigate={onNavigate} />
}
