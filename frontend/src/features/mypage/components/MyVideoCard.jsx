import { useState } from 'react'
import { Link } from 'react-router-dom'
import fallbackThumbnail from '../../../assets/video.png'

// 좋아요·시청기록이 같이 쓰는 영상 카드. 누르면 학습 화면으로 간다.
export function Thumbnail({ src, className }) {
  const [failed, setFailed] = useState(false)
  return (
    <img
      className={className}
      src={src && !failed ? src : fallbackThumbnail}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

export default function MyVideoCard({ video }) {
  return (
    <Link className="mpl-video" to={`/learn/${video.videoId}`}>
      <Thumbnail className="mpl-video__thumb" src={video.thumbnailUrl} />
      <span className="mpl-video__title">{video.title}</span>
      <span className="mpl-muted">
        {video.categoryName} · ♥ {video.likeCount}
      </span>
    </Link>
  )
}
