import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

export default function LoginFeature() {
  const [view, setView] = useState('login')

  if (view === 'signup') return <SignupPage onNavigate={setView} />
  if (view === 'forgot') return <ForgotPasswordPage onNavigate={setView} />
  return <LoginPage onNavigate={setView} />
}
