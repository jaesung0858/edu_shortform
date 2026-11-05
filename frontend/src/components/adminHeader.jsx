import './adminHeader.css'
import logo from '../assets/logo.png'

function AdminHeader({ user, loading, onLogout, loggingOut }) {

  return (
    <header className="site-header">
      <img src={logo} alt="로고" className="logo" />
      
      {loading ? (
        <span>회원 정보 확인 중…</span>
      ) : user ? (
        <>
          <div className="headId">관리자 {user.nickname}님 반갑습니다</div>
          <button className="logout" type="button" onClick={onLogout} disabled={loggingOut}>
            {loggingOut ? '로그아웃 중…' : '로그아웃'}
          </button>
        </>
      ) : (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate('/login')}
        >
          로그인
        </button>
      )}
    </header>
  )
}

export default AdminHeader
