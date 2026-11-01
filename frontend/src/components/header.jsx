import './header.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import logo from '../assets/logo.png'

function Header({ user, loading, onLogout, loggingOut }) {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  return (
    <header className="site-header">
      <Link to="/home"><img src={logo} alt="로고" className="logo" /></Link>
      <div className="searchInput">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
        <button type="button" className='btn-secondary' onClick={() => console.log(search)}>검색</button>
      </div>
      {loading ? (
        <span>회원 정보 확인 중…</span>
      ) : user ? (
        <>
          <div className="headId">{user.nickname}님 반갑습니다</div>
          <button className="logout" type="button" onClick={onLogout} disabled={loggingOut}>
            {loggingOut ? '로그아웃 중…' : '로그아웃'}
          </button>
        </>
      ) : (
        <button
          type="button-secondary"
          className="header-login"
          onClick={() => navigate('/login')}
        >
          로그인
        </button>
      )}
    </header>
  )
}

export default Header
