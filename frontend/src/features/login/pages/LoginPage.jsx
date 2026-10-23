import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../../../api/auth'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'

export default function LoginPage({ onNavigate }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [message, setMessage] = useState(location.state?.signupComplete ? '회원가입이 완료되었습니다. 로그인해주세요.' : '')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (pending) return
    const form = new FormData(event.currentTarget)
    setPending(true)
    setMessage('')
    try {
      await login(form.get('email').trim(), form.get('password'))
      navigate('/home', { replace: true })
    } catch (error) {
      setMessage(error.response?.status === 401
        ? '이메일 또는 비밀번호를 확인해주세요.'
        : '로그인하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout
      title="로그인"
      description="계정에 로그인하고 오늘의 배움을 이어가세요."
      footer={
        <>
          <span>아직 계정이 없으신가요?</span>
          <button className="text-button signup-button" type="button" onClick={() => onNavigate('signup')}>
            회원가입
          </button>
        </>
      }
    >
      <form className="login-form" onSubmit={handleSubmit}>
        <TextField
          id="email"
          label="이메일"
          type="email"
          placeholder="이메일 주소를 입력하세요"
          autoComplete="email"
          maxLength={100}
        />
        <TextField
          id="password"
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          autoComplete="current-password"
        />

        <div className="login-options">
          <button className="text-button" type="button" onClick={() => onNavigate('forgot')}>
            비밀번호 찾기
          </button>
        </div>

        <button className="login-button" type="submit" disabled={pending}>{pending ? '로그인 중…' : '로그인'}</button>
        <p className="login-message" role="status" aria-live="polite">{message}</p>
      </form>
    </AuthLayout>
  )
}
