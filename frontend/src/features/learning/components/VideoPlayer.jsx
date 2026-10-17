import { useState } from 'react'

// 세로형 숏폼 플레이어. 브라우저 자동재생 정책 때문에 음소거로 시작하고, 컨트롤에서 소리를 켤 수 있다.
export default function VideoPlayer({ video, onEnded }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="lp-video">
      {failed ? (
        <div className="lp-video__error">
          <p>영상을 불러오지 못했어요.</p>
          <button type="button" className="lp-btn lp-btn--primary" onClick={onEnded}>
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
          onEnded={onEnded}
          onError={() => setFailed(true)}
        />
      )}
      <div className="lp-video__info">
        <span className="lp-tag">#{video.tagName}</span>
        <h2 className="lp-video__title">{video.title}</h2>
        {video.description && <p className="lp-video__desc">{video.description}</p>}
      </div>
    </div>
  )
}
