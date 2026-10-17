import { useState } from 'react'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'

export default function SignupPage({ onNavigate }) {
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    if (formData.get('password') !== formData.get('passwordConfirm')) {
      setMessage('비밀번호가 서로 일치하지 않습니다.')
      return
    }

    setMessage('회원가입 API가 아직 연결되지 않았어요.')
  }

  return (
    <AuthLayout
      title="회원가입"
      description="더존과 함께 새로운 배움을 시작해 보세요."
      footer={
        <>
          <span>이미 계정이 있으신가요?</span>
          <button className="text-button signup-button" type="button" onClick={() => onNavigate('login')}>
            로그인
          </button>
        </>
      }
    >
      <form className="login-form" onSubmit={handleSubmit}>
        <TextField id="name" label="이름" placeholder="이름을 입력하세요" autoComplete="name" />
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
          placeholder="8자 이상 입력하세요"
          autoComplete="new-password"
          minLength={8}
        />
        <TextField
          id="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          autoComplete="new-password"
          minLength={8}
        />
        <button className="login-button" type="submit">가입하기</button>
        <p className="login-message" role="status" aria-live="polite">{message}</p>
      </form>
    </AuthLayout>
  )
}
