import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

export default function LoginPage({ onNavigate }) {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (pending) return

    const form = new FormData(event.currentTarget)
    const email = form.get('email').trim()
    const password = form.get('password')
    setPending(true)
    setMessage('')

    try {
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams({ username: email, password }),
      })

      if (!response.ok) {
        setMessage(response.status === 401
          ? '이메일 또는 비밀번호를 확인해주세요.'
          : '로그인하지 못했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

      navigate('/myChannel', { replace: true })
    } catch {
      setMessage('로그인하지 못했습니다. 서버 연결을 확인한 뒤 다시 시도해주세요.')
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

        <button className="login-button" type="submit" disabled={pending}>
          {pending ? '로그인 중…' : '로그인'}
        </button>
        <p className="login-message" role="status" aria-live="polite">{message}</p>
      </form>
    </AuthLayout>
  )
}
