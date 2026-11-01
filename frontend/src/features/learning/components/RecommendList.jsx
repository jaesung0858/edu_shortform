import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecommendations, isLoginRequired } from '../api/learningApi'
import LoginRequired from './LoginRequired'

// 썸네일이 없거나 이미지를 못 불러오면 ▶로 대신한다.
function CardThumb({ src }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="lp-card__thumb" aria-hidden="true">
      {src && !failed ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} /> : '▶'}
    </div>
  )
}

export default function RecommendList({ videoId, correct }) {
  const [state, setState] = useState({ status: 'loading', items: [] })

  useEffect(() => {
    let ignore = false
    getRecommendations(videoId, correct)
      .then((items) => !ignore && setState({ status: 'ready', items }))
      .catch((e) => !ignore && setState({ status: isLoginRequired(e) ? 'login' : 'error', items: [] }))
    return () => {
      ignore = true
    }
  }, [videoId, correct])

  if (state.status === 'loading') return <p className="lp-muted">추천 영상을 고르는 중…</p>
  if (state.status === 'login') return <LoginRequired message="로그인이 필요해요. 로그인하면 맞춤 추천 영상을 볼 수 있어요." />
  if (state.status === 'error') return <p className="lp-muted">추천 영상을 불러오지 못했어요.</p>
  if (state.items.length === 0) return null

  return (
    <section className="lp-recommend">
      <h3 className="lp-recommend__title">이어서 보면 좋은 영상</h3>
      <ul className="lp-recommend__list">
        {state.items.map((item) => (
          <li key={item.videoId}>
            <Link className="lp-card" to={`/learn/${item.videoId}`}>
              <CardThumb src={item.thumbnailUrl} />
              <div className="lp-card__body">
                <span className="lp-card__reason">{item.reason}</span>
                <span className="lp-card__title">{item.title}</span>
                <span className="lp-muted">♥ {item.likeCount}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
