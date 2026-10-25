import './header.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import logo from '../assets/logo.png'

function Header({ user, loading, onLogout, loggingOut }) {
  const [search, setSearch] = useState('')

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
        <button type="button" onClick={() => console.log(search)}>검색</button>
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
        <Link to="/login">로그인</Link>
      )}
    </header>
  )
}

export default Header
