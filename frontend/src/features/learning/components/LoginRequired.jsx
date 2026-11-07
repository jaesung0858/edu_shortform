import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// 채점·추천·좋아요 API가 401을 줬을 때 보여주는 안내. 로그인하면 보던 학습 화면으로 돌아온다.
export default function LoginRequired({ message = '로그인이 필요해요' }) {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const ref = useRef(null)

  // 영상 아래에 뜨면 화면 밖일 수 있어서 보이는 곳까지 스크롤한다
  useEffect(() => {
    ref.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }, [])

  return (
    <div ref={ref} className="lp-login-required" role="alert">
      <p>{message}</p>
      <button type="button" className="lp-btn btn-primary" onClick={() => navigate('/login', { state: { from: { pathname, search } } })}>
        로그인하러 가기
      </button>
    </div>
  )
}
