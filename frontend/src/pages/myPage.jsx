import { useOutletContext } from 'react-router-dom'
import VideoList from '../components/videoList'
import'./mypage.css'
import img from '../assets/video.png'


function MyPage(){

    const {
        user,
        loading: sessionLoading,
        error: sessionError
    } = useOutletContext()

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

    return (
        <div className="mypage">
        <div className="profile">
            <div className="profile-user">
                <div className="profile-avatar">
                    {user?.nickname?.charAt(0) || 'U'}
                </div>

                <div className="profile-info">
                    <h2>
                        {user?.nickname || '사용자'}
                        <span> 님</span>
                    </h2>
                    <p>{user?.email || '이메일 정보 없음'}</p>
                </div>
            </div>

            <div className="profile-actions">
                <button className="profile-edit">
                    정보 수정
                </button>
                <button className="profile-delete">
                    회원 탈퇴
                </button>
            </div>
        </div>
        <div className="watch-history"><VideoList title="시청기록" videos={watchHistory}/></div>
        <div className="mypage-bottom-section">
            <div className="liked-video"><VideoList title="좋아요한 목록" videos={likedVideo}/></div>
            <div className="wrong-note"><VideoList title="오답노트" videos={wrongVideos}/></div>
            </div>
        </div>
    )
}

export default MyPage
