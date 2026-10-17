import { useState } from 'react'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'

export default function ForgotPasswordPage({ onNavigate }) {
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('비밀번호 재설정 API가 아직 연결되지 않았어요.')
  }

  return (
    <AuthLayout
      title="비밀번호 찾기"
      description="가입한 이메일 주소를 입력해 주세요."
      footer={
        <button className="text-button signup-button" type="button" onClick={() => onNavigate('login')}>
          로그인으로 돌아가기
        </button>
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
        <button className="login-button" type="submit">재설정 안내 받기</button>
        <p className="login-message" role="status" aria-live="polite">{message}</p>
      </form>
    </AuthLayout>
  )
}
