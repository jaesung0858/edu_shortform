import { useState } from 'react'
import './App.css'

function App() {
  const [view, setView] = useState('login')
  const [message, setMessage] = useState('')

  function changeView(nextView) {
    setView(nextView)
    setMessage('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    if (view === 'signup') {
      if (formData.get('password') !== formData.get('passwordConfirm')) {
        setMessage('비밀번호가 서로 일치하지 않습니다.')
        return
      }
      setMessage('회원가입 API가 아직 연결되지 않았어요.')
      return
    }

    if (view === 'forgot') {
      setMessage('비밀번호 재설정 기능은 백엔드 연결 후 사용할 수 있어요.')
      return
    }

    setMessage('로그인 API가 아직 연결되지 않았어요.')
  }

  const isSignup = view === 'signup'
  const isForgot = view === 'forgot'

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <a className="brand" href="#home" aria-label="더존 홈">
          <span className="brand-mark" aria-hidden="true">▶</span>
          <span className="brand-name">더존</span>
        </a>

        <div className="login-heading">
          <h1 id="login-title">
            {isSignup ? '회원가입' : isForgot ? '비밀번호 찾기' : '로그인'}
          </h1>
          <p className="login-description">
            {isSignup && '더존과 함께 새로운 배움을 시작해 보세요.'}
            {isForgot && '가입한 이메일 주소를 입력해 주세요.'}
            {!isSignup && !isForgot && '계정에 로그인하고 오늘의 배움을 이어가세요.'}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignup && (
            <div className="field-group">
              <label htmlFor="name">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="이름을 입력하세요"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="field-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="이메일 주소를 입력하세요"
              autoComplete="email"
              required
            />
          </div>

          {!isForgot && (
            <div className="field-group">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder={isSignup ? '8자 이상 입력하세요' : '비밀번호를 입력하세요'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                minLength={isSignup ? 8 : undefined}
                required
              />
            </div>
          )}

          {isSignup && (
            <div className="field-group">
              <label htmlFor="passwordConfirm">비밀번호 확인</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          )}

          {!isSignup && !isForgot && (
            <div className="login-options">
              <label className="remember-option" htmlFor="remember">
                <input id="remember" name="remember" type="checkbox" />
                <span>로그인 상태 유지</span>
              </label>
              <button
                className="text-button"
                type="button"
                onClick={() => changeView('forgot')}
              >
                비밀번호 찾기
              </button>
            </div>
          )}

          <button className="login-button" type="submit">
            {isSignup ? '가입하기' : isForgot ? '재설정 안내 받기' : '로그인'}
          </button>
          <p className="login-message" role="status" aria-live="polite">{message}</p>
        </form>

        <div className="signup-prompt">
          {isSignup && (
            <>
              <span>이미 계정이 있으신가요?</span>
              <button className="text-button signup-button" type="button" onClick={() => changeView('login')}>
                로그인
              </button>
            </>
          )}
          {isForgot && (
            <button className="text-button signup-button" type="button" onClick={() => changeView('login')}>
              로그인으로 돌아가기
            </button>
          )}
          {!isSignup && !isForgot && (
            <>
              <span>아직 계정이 없으신가요?</span>
              <button className="text-button signup-button" type="button" onClick={() => changeView('signup')}>
                회원가입
              </button>
            </>
          )}
        </div>

        <p className="login-note">짧게 보고, 깊게 배우다.</p>
      </section>
    </main>
  )
}

export default App
