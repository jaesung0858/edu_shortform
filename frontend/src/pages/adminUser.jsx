import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../auth/useAuthSession'
import {
  getAdminUsers,
  deleteAdminUser,
  updateAdminUserNickname
} from '../api/admin'
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
    const [editUserId, setEditUserId] = useState(null)
    const [editNickname, setEditNickname] = useState('')
    const [deleteUserId, setDeleteUserId] = useState(null)

    async function handleSearch() {
        try {
            const data = await getAdminUsers(keyword)
            setUsers(data)
        } catch (error) {
            setMessage(error.message)
        }
    }

    async function handleDelete() {
        try {
            await deleteAdminUser(deleteUserId)

            setUsers((prevUsers) =>
                prevUsers.filter((user) => user.userId !== deleteUserId)
            )

            setDeleteUserId(null)
            setMessage('회원이 삭제되었습니다.')
        } catch (error) {
            setMessage(error.message)
            setDeleteUserId(null)
        }

    }

    async function handleUpdate(userId) {
        try {
            setMessage('')

            const updatedUser = await updateAdminUserNickname(
            userId,
            editNickname
            )

            setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.userId === userId ? updatedUser : user
            )
            )

            setEditUserId(null)
            setEditNickname('')
            setMessage('회원 정보가 수정되었습니다.')
        } catch (error) {
            setMessage(error.message)
        }
    }

    function handleEdit(user) {
        setEditUserId(user.userId)
        setEditNickname(user.nickname)
    }

    function handleCancel() {
        setEditUserId(null)
        setEditNickname('')
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
                <span>
                    {editUserId === user.userId ? (
                        <input
                        type="text"
                        value={editNickname}
                        onChange={(e) => setEditNickname(e.target.value)}
                        />
                    ) : (
                        user.nickname
                    )}
                </span>
                <span>{user.email}</span>
                <span>{user.role}</span>
                <span>{user.createdAt}</span>

                <span className="admin-user-actions">
                    {editUserId === user.userId ? (
                        <>
                        <button type="button" className='btn-secondary' onClick={() => handleUpdate(user.userId)}>
                            확인
                        </button>

                        <button type="button"className='btn-secondary' onClick={handleCancel}>
                            취소
                        </button>
                        </>
                    ) : (
                        <>
                        <button
                            type="button"
                            className='btn-secondary'
                            onClick={() => handleEdit(user)}
                        >
                            수정
                        </button>

                        <button
                            type="button"
                            className="btn-danger"
                            onClick={() => setDeleteUserId(user.userId)}
                        >
                            삭제
                        </button>
                        </>
                    )}
                </span>
            </div>
            ))}
        </div>
        {deleteUserId !== null && (
            <div className="delete-modal-overlay">
                <div className="delete-modal">
                    <h3>회원 삭제</h3>

                    <p>정말로 이 회원을 삭제하시겠습니까?</p>

                    <div className="delete-modal-buttons">

                        <button
                            type="button"
                            className="btn-danger"
                            onClick={handleDelete}
                        >
                            삭제
                        </button>

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setDeleteUserId(null)}
                        >
                            취소
                        </button>

                    </div>
                </div>
            </div>
        )}
        </section>
    )
}
