import { useState } from 'react'
import { signup } from '../../../api/auth'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'

export default function SignupPage({ onNavigate }) {
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (pending) return
    const formData = new FormData(event.currentTarget)

    if (formData.get('password') !== formData.get('passwordConfirm')) {
      setMessage('비밀번호가 서로 일치하지 않습니다.')
      return
    }

    setPending(true)
    setMessage('')
    try {
      await signup({
        email: formData.get('email').trim(),
        nickname: formData.get('nickname').trim(),
        password: formData.get('password'),
      })
      onNavigate('login', { state: { signupComplete: true } })
    } catch (error) {
      const status = error.response?.status
      setMessage(status === 409 ? '이미 사용 중인 이메일 또는 닉네임입니다.'
        : status === 400 ? '이메일·닉네임과 비밀번호 입력 조건을 확인해주세요.'
          : '회원가입하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setPending(false)
    }
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
        <TextField id="nickname" label="닉네임" placeholder="닉네임을 입력하세요" autoComplete="nickname" maxLength={30} pattern=".*\S.*" title="공백이 아닌 닉네임을 입력해주세요." />
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
          placeholder="영문·숫자·특수문자 8~24자"
          autoComplete="new-password"
          minLength={8}
          maxLength={24}
          pattern="[!-~]+"
          title="공백 없이 영문·숫자·특수문자 8~24자를 입력해주세요."
        />
        <TextField
          id="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          autoComplete="new-password"
          minLength={8}
          maxLength={24}
        />
        <button className="login-button" type="submit" disabled={pending}>{pending ? '가입 중…' : '가입하기'}</button>
        <p className="login-message" role="status" aria-live="polite">{message}</p>
      </form>
    </AuthLayout>
  )
}
