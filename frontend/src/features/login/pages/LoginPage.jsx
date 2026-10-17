import { useState } from 'react'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'

export default function LoginPage({ onNavigate }) {
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('로그인 API가 아직 연결되지 않았어요.')
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
        />
        <TextField
          id="password"
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          autoComplete="current-password"
        />

        <div className="login-options">
          <label className="remember-option" htmlFor="remember">
            <input id="remember" name="remember" type="checkbox" />
            <span>로그인 상태 유지</span>
          </label>
          <button className="text-button" type="button" onClick={() => onNavigate('forgot')}>
            비밀번호 찾기
          </button>
        </div>

        <button className="login-button" type="submit">로그인</button>
        <p className="login-message" role="status" aria-live="polite">{message}</p>
      </form>
    </AuthLayout>
  )
}
