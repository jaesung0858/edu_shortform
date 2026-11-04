import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../auth/useAuthSession'
import { getAdminUsers } from '../api/admin'
import './adminUser.css'

export default function AdminUser() {
    const navigate = useNavigate()
    const { session } = useAuthSession()

    useEffect(() => {
        if (session.loading) return

        if (!session.user || session.user.role !== 'ADMIN') {
        navigate('/home', { replace: true })
        }
    }, [session.loading, session.user, navigate])

    useEffect(() => {
        async function loadUsers() {
            try {
            const data = await getAdminUsers()
            setUsers(data)
            } catch (error) {
            console.error('회원 목록 조회 실패:', error)
            }
        }

        loadUsers()
    }, [])

    const [keyword, setKeyword] = useState('')
    const [users, setUsers] = useState([])
    const [message, setMessage] = useState('')

    async function handleSearch() {
        try {
            const data = await getAdminUsers(keyword)
            setUsers(data)
        } catch (error) {
            setMessage(error.message)
        }
    }

    function handleDelete(userId) {
        console.log('삭제 회원:', userId)
    }

    return (
        <section className="admin-user-page">
        <h1>회원 관리</h1>

        <div className="admin-user-search">
            <input
            type="text"
            placeholder="닉네임 또는 이메일을 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            />

            <button type="button" onClick={handleSearch}>
            검색
            </button>
        </div>
        {message && <p className="admin-user-message">{message}</p>}

        <div className="admin-user-table">
            <div className="admin-user-row admin-user-header">
            <span>ID</span>
            <span>닉네임</span>
            <span>이메일</span>
            <span>권한</span>
            <span>가입일</span>
            <span>관리</span>
            </div>

            {users.map((user) => (
            <div className="admin-user-row" key={user.userId}>
                <span>{user.userId}</span>
                <span>{user.nickname}</span>
                <span>{user.email}</span>
                <span>{user.role}</span>
                <span>{user.createdAt}</span>

                <span>
                <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDelete(user.userId)}
                >
                    삭제
                </button>
                </span>
            </div>
            ))}
        </div>
        </section>
    )
}