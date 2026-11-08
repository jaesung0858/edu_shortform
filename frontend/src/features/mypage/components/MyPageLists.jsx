import { getLikedVideos, getWatchHistory, getWrongNotes } from '../api/mypageApi'
import MyVideoCard from './MyVideoCard'
import PagedList from './PagedList'
import WrongNoteCard from './WrongNoteCard'
import '../mypage-lists.css'

// PagedList는 fetchPage가 바뀌면 다시 불러오므로, 컴포넌트 밖에 고정해 둔다.
const fetchWatchHistory = (page) => getWatchHistory(page).then(({ videos, hasNext }) => ({ items: videos, hasNext }))
const fetchLikedVideos = (page) => getLikedVideos(page).then(({ videos, hasNext }) => ({ items: videos, hasNext }))
const fetchWrongNotes = (page) => getWrongNotes(page).then(({ notes, hasNext }) => ({ items: notes, hasNext }))

// 같은 영상이 쪽 사이에 다시 나올 수 있어서(그사이 새로 본 영상 등) 순서도 key에 넣는다.
const renderVideo = (video, i) => (
  <li key={`${video.videoId}-${i}`}>
    <MyVideoCard video={video} />
  </li>
)
const renderNote = (note) => (
  <li key={note.quizId}>
    <WrongNoteCard note={note} />
  </li>
)

// 마이페이지 아래쪽 목록 3개. 감싸는 div 클래스는 기존 mypage.css 배치를 그대로 따른다.
export default function MyPageLists() {
  return (
    <>
      <div className="watch-history">
        <PagedList
          title="시청기록"
          fetchPage={fetchWatchHistory}
          emptyText="아직 본 영상이 없어요."
          listClassName="mpl-video-row"
          renderItem={renderVideo}
        />
      </div>
      <div className="mypage-bottom-section">
        <div className="liked-video">
          <PagedList
            title="좋아요한 목록"
            fetchPage={fetchLikedVideos}
            emptyText="아직 좋아요한 영상이 없어요."
            listClassName="mpl-video-row"
            renderItem={renderVideo}
          />
        </div>
        <div className="wrong-note">
          <PagedList
            title="오답노트"
            fetchPage={fetchWrongNotes}
            emptyText="틀린 문제가 없어요. 잘하고 있어요!"
            listClassName="mpl-note-list"
            renderItem={renderNote}
          />
        </div>
      </div>
    </>
  )
}
