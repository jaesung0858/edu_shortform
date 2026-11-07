import { useRef, useState } from 'react'
import { addView } from '../api/learningApi'

const formatCount = (n) => (n ?? 0).toLocaleString('ko-KR')

// 세로형 숏폼 플레이어. 브라우저 자동재생 정책 때문에 음소거로 시작하고, 컨트롤에서 소리를 켤 수 있다.
export default function VideoPlayer({ video, like, likePending, onToggleLike, onEnded }) {
  const [failed, setFailed] = useState(false)
  const viewCounted = useRef(false)

  // 처음 재생될 때 한 번만 조회 수·시청 기록을 남긴다. 실패해도 학습은 계속한다.
  function handlePlay() {
    if (viewCounted.current) return
    viewCounted.current = true
    addView(video.videoId).catch(() => {})
  }

  return (
    <div className="lp-video">
      {failed ? (
        <div className="lp-video__error">
          <p>영상을 불러오지 못했어요.</p>
          <button type="button" className="lp-btn btn-primary" onClick={onEnded}>
            퀴즈 바로 풀기
          </button>
        </div>
      ) : (
        <video
          className="lp-video__media"
          src={video.videoUrl}
          autoPlay
          muted
          playsInline
          controls
          onPlay={handlePlay}
          onEnded={onEnded}
          onError={() => setFailed(true)}
        />
      )}
      <div className="lp-video__info">
        <span className="lp-tag">#{video.tagName}</span>
        <h2 className="lp-video__title">{video.title}</h2>
        {video.description && <p className="lp-video__desc">{video.description}</p>}
        <p className="lp-video__stats">
          <span>조회수 {formatCount(video.viewCount)}</span>
          <button
            type="button"
            className={`lp-like${like.liked ? ' is-liked' : ''}`}
            aria-pressed={like.liked}
            aria-label={`좋아요 ${formatCount(like.likeCount)}개${like.liked ? ', 누름' : ''}`}
            disabled={likePending}
            onClick={onToggleLike}
          >
            {like.liked ? '♥' : '♡'} {formatCount(like.likeCount)}
          </button>
        </p>
      </div>
    </div>
  )
}
