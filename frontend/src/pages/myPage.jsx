import { useOutletContext } from 'react-router-dom'
import MyPageVideoList from '../components/mypageVideoList'
import {useState} from 'react'
import {
    updateNickname,
    updatePassword,
    deleteAccount
} from '../api/auth'
import'./mypage.css'
import img from '../assets/video.png'


function MyPage(){

    const {
        user,
        loading: sessionLoading,
        error: sessionError,
        refreshSession
    } = useOutletContext()

    const [editModal, setEditModal] = useState(null)
    const [nickname, setNickname] = useState('')
    const [message, setMessage] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteModal, setDeleteModal] = useState(false)

    if (sessionLoading) {
        return <p>회원 정보를 확인하고 있습니다.</p>
    }
    const watchHistory = [{ id: 1, title: "React 기초 배우기", like: 120, look: 1500, creator: "김철수", category: "개발", thumbnail:img },
        { id: 2, title: "면접 자기소개 잘하는 법", like: 85, look: 980, creator: "이영희", category: "취업", thumbnail:img},
        { id: 3, title: "JavaScript 핵심 문법", like: 230, look: 3200, creator: "박민수", category: "개발" , thumbnail:img}];
    const likedVideo = [{ id: 1, title: "React 기초 배우기", like: 120, look: 1500, creator: "김철수", category: "개발", thumbnail:img },
        { id: 2, title: "면접 자기소개 잘하는 법", like: 85, look: 980, creator: "이영희", category: "취업", thumbnail:img},
        { id: 3, title: "JavaScript 핵심 문법", like: 230, look: 3200, creator: "박민수", category: "개발" , thumbnail:img},
        { id: 4, title: "직장인 이메일 작성법", like: 65, look: 750, creator: "최지은", category: "직장생활" , thumbnail:img},
        { id: 5, title: "SQL 기본 개념 정리", like: 175, look: 2100, creator: "정우진", category: "개발" , thumbnail:img},
        { id: 6, title: "이력서 작성 꿀팁", like: 310, look: 4500, creator: "한수빈", category: "취업" , thumbnail:img},
        { id: 7, title: "엑셀 함수 3분 정리", like: 145, look: 1800, creator: "오세훈", category: "업무스킬" , thumbnail:img},
        { id: 8, title: "효율적인 시간 관리 방법", like: 95, look: 1200, creator: "윤하늘", category: "자기계발" , thumbnail:img},
        { id: 9, title: "Python 입문 가이드", like: 270, look: 3900, creator: "서준호", category: "개발" , thumbnail:img},
        { id: 10, title: "신입사원이 알아야 할 보고법", like: 190, look: 2600, creator: "강다은", category: "직장생활" , thumbnail:img}];
    const wrongVideos = [{ id: 1, title: "React 기초 배우기", like: 120, look: 1500, creator: "김철수", category: "개발", thumbnail:img },
        { id: 2, title: "면접 자기소개 잘하는 법", like: 85, look: 980, creator: "이영희", category: "취업", thumbnail:img},
        { id: 3, title: "JavaScript 핵심 문법", like: 230, look: 3200, creator: "박민수", category: "개발" , thumbnail:img},
        { id: 4, title: "직장인 이메일 작성법", like: 65, look: 750, creator: "최지은", category: "직장생활" , thumbnail:img},
        { id: 5, title: "SQL 기본 개념 정리", like: 175, look: 2100, creator: "정우진", category: "개발" , thumbnail:img},
        { id: 6, title: "이력서 작성 꿀팁", like: 310, look: 4500, creator: "한수빈", category: "취업" , thumbnail:img},
        { id: 7, title: "엑셀 함수 3분 정리", like: 145, look: 1800, creator: "오세훈", category: "업무스킬" , thumbnail:img},
        { id: 8, title: "효율적인 시간 관리 방법", like: 95, look: 1200, creator: "윤하늘", category: "자기계발" , thumbnail:img},
        { id: 9, title: "Python 입문 가이드", like: 270, look: 3900, creator: "서준호", category: "개발" , thumbnail:img},
        { id: 10, title: "신입사원이 알아야 할 보고법", like: 190, look: 2600, creator: "강다은", category: "직장생활" , thumbnail:img}];
    
    if (!user) {
        return (
            <section className="my-page">
                <p className="my-page-message" role={sessionError ? 'alert' : undefined}>
                {sessionError || '내 정보를 보려면 로그인해주세요.'}
                </p>
            </section>
        )
    }


   async function handleUpdate() {
        try {
            setMessage('')

            await updateNickname(nickname)
            await refreshSession()

            // 성공했을 때만 닫기
            setEditModal(null)
            setNickname('')
            

        } catch (error) {
            // 실패하면 setEditModal을 건드리지 않음
            // → nickname 모달이 그대로 열려 있음
            setMessage(
                error.response?.data?.message ||
                error.message ||
                '닉네임 변경에 실패했습니다.'
            )
        }
    }
    async function handlePasswordUpdate() {
        if (newPassword !== confirmPassword) {
            setMessage('새 비밀번호가 일치하지 않습니다.')
            return
        }

        try {
            setMessage('')

            await updatePassword(currentPassword, newPassword)

            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setEditModal(null)

        } catch (error) {
            setMessage(
                error.message ||
                '비밀번호 변경에 실패했습니다.'
            )
        }
    }

    async function handleDeleteAccount() {
        try {
            setMessage('')

            await deleteAccount(deletePassword)

            setDeletePassword('')
            setDeleteModal(false)

            await refreshSession()
        } catch (error) {
            setMessage(
                error.message ||
                '회원 탈퇴에 실패했습니다.'
            )
        }
    }

    return (
        <div className="mypage">
        <div className="profile">
            <div className="profile-user">
                <div className="profile-avatar">
                    {user?.nickname?.charAt(0) || 'U'}
                </div>

                <div className="profile-info">
                    <h3>{user?.nickname ? `${user.nickname}님` : '닉네임 정보 없음'}</h3>
                    <h4>{user?.email || '이메일 정보 없음'}</h4>
                    
                </div>
            </div>

            <div className="profile-actions">
                <button
                    type="button"
                    className="profile-edit"
                    onClick={() => setEditModal('menu')}
                >
                    정보 수정
                </button>

                <button
                    type="button"
                    className="btn-danger"
                    onClick={() => {
                        setDeletePassword('')
                        setMessage('')
                        setDeleteModal(true)
                    }}
                >
                    회원 탈퇴
                </button>
            </div>
            
        </div>

       {editModal === 'menu' && (
            <div className="menu-modal-overlay">
                <div className="menu-modal">
                    <h3>회원 정보 수정</h3>

                    <div className="menu-modal-buttons">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                setNickname(user.nickname)
                                setEditModal('nickname')
                                setMessage('')
                            }}
                        >
                            닉네임 변경
                        </button>

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                setCurrentPassword('')
                                setNewPassword('')
                                setConfirmPassword('')
                                setMessage('')
                                setEditModal('password')
                            }}
                        >
                            비밀번호 변경
                        </button>

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {setEditModal(null)
                                            setMessage('')}
                                        
                            }
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        )}

        {editModal === 'nickname' && (
            <div className="nickname-modal-overlay">
                <div className="nickname-modal">
                    <h3>닉네임 변경</h3>

                    <input
                        type="text"
                        value={nickname}
                        maxLength={30}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="새 닉네임을 입력하세요"
                    />
                    {message && (
                        <p className="profile-message">
                            {message}
                        </p>
                    )}

                    <div className="nickname-modal-buttons">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleUpdate}
                        >
                            변경
                        </button>

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setEditModal('menu')}
                        >
                            이전
                        </button>

                    </div>
                </div>
            </div>
        )}

        {editModal === 'password' && (
            <div className="password-modal-overlay">
                <div className="password-modal">
                    <form autoComplete="off">
                        <h3>비밀번호 변경</h3>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="현재 비밀번호"
                            autoComplete="off"
                        />

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호"
                            autoComplete="new-password"
                        />

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="새 비밀번호 확인"
                            autoComplete="new-password"
                        />
                        {message && (
                            <p className="profile-message">
                                {message}
                            </p>
                        )}

                        <div className="password-modal-buttons">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handlePasswordUpdate}
                            >
                                변경
                            </button>

                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setEditModal('menu')}
                            >
                                이전
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {deleteModal && (
            <div className="delete-modal-overlay">
                <div className="delete-modal">
                    <h3>회원 탈퇴</h3>

                    <p>정말로 탈퇴하시겠습니까?</p>

                    <form
                        autoComplete="off"
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleDeleteAccount()
                        }}
                    >
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="현재 비밀번호"
                            autoComplete="new-password"
                        />

                         {message && (
                            <p className="profile-message">
                                {message}
                            </p>
                        )}


                        <div className="delete-modal-buttons">
                            <button
                                type="submit"
                                className="btn-danger"
                            >
                                탈퇴
                            </button>

                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => {
                                    setDeletePassword('')
                                    setMessage('')
                                    setDeleteModal(false)
                                }}
                            >
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        
        <div className="watch-history"><MyPageVideoList title="시청기록" videos={watchHistory}/></div>
        <div className="mypage-bottom-section">
            <div className="liked-video"><MyPageVideoList title="좋아요한 목록" videos={likedVideo}/></div>
            <div className="wrong-note"><MyPageVideoList title="오답노트" videos={wrongVideos}/></div>
            </div>
        </div>
    )
}

export default MyPage
