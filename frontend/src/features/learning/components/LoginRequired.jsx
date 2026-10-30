import { useNavigate } from 'react-router-dom'

// 채점·추천 API가 401을 줬을 때 보여주는 안내
export default function LoginRequired({ message = '로그인이 필요해요' }) {
  const navigate = useNavigate()

  return (
    <div className="lp-login-required" role="alert">
      <p>{message}</p>
      <button type="button" className="lp-btn lp-btn--primary" onClick={() => navigate('/login')}>
        로그인하러 가기
      </button>
    </div>
  )
}
