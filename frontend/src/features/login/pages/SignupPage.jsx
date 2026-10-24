import { useState } from 'react'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

export default function SignupPage({ onNavigate }) {
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (pending || succeeded) return

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name').trim()
    const email = formData.get('email').trim()
    const password = formData.get('password')
    const passwordConfirm = formData.get('passwordConfirm')

    if (!name) {
      setMessage('이름을 입력해주세요.')
      return
    }
    if (password.length < 8 || password.length > 24 || !/^[!-~]+$/.test(password)) {
      setMessage('비밀번호는 영문, 숫자, 특수문자를 사용해 8~24자로 입력해주세요.')
      return
    }
    if (password !== passwordConfirm) {
      setMessage('비밀번호가 서로 일치하지 않습니다.')
      return
    }

    setPending(true)
    setMessage('')
    try {
      const response = await fetch(`${apiBaseUrl}/api/users`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nickname: name }),
      })

      if (!response.ok) {
        setMessage(response.status === 409
          ? '이미 사용 중인 이메일 또는 이름입니다.'
          : response.status === 400
            ? '입력한 정보를 확인해주세요. 비밀번호는 영문, 숫자, 특수문자만 사용할 수 있습니다.'
            : '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

      setSucceeded(true)
      setMessage('회원가입이 완료되었습니다. 로그인해주세요.')
    } catch {
      setMessage('회원가입에 실패했습니다. 서버 연결을 확인한 뒤 다시 시도해주세요.')
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
        <TextField id="name" label="이름" placeholder="이름을 입력하세요" autoComplete="name" maxLength={30} />
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
          placeholder="8~24자, 영문·숫자·특수문자"
          autoComplete="new-password"
          minLength={8}
          maxLength={24}
          pattern="[!-~]+"
        />
        <TextField
          id="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          autoComplete="new-password"
          minLength={8}
          maxLength={24}
          pattern="[!-~]+"
        />
        <button className="login-button" type="submit" disabled={pending || succeeded}>
          {pending ? '가입 중…' : succeeded ? '가입 완료' : '가입하기'}
        </button>
        <p className="login-message" role="status" aria-live="polite">{message}</p>
        {succeeded && (
          <button className="text-button signup-button" type="button" onClick={() => onNavigate('login')}>
            로그인 화면으로 이동
          </button>
        )}
      </form>
    </AuthLayout>
  )
}
