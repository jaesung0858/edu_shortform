import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { getMyVideos } from '../api/videos'
import fallbackThumbnail from '../assets/video.png'
import './myChannel.css'

export default function MyChannel() {
  const { user, loading: sessionLoading, error: sessionError } = useOutletContext()
  const [page, setPage] = useState(0)
  const [retry, setRetry] = useState(0)
  const [list, setList] = useState({
    videos: [],
    hasNext: false,
    loading: true,
    error: '',
    status: null,
  })

  useEffect(() => {
    if (sessionLoading || !user) return
    let active = true

    getMyVideos(page)
      .then(data => {
        if (!active) return
        setList(previous => ({
          videos: page === 0 ? data.videos : [...previous.videos, ...data.videos],
          hasNext: Boolean(data.hasNext),
          loading: false,
          error: '',
          status: null,
        }))
      })
      .catch(error => {
        if (!active) return
        setList(previous => ({
          ...previous,
          loading: false,
          error: error.response?.status === 401
            ? '로그인이 필요하거나 세션이 만료되었습니다.'
            : '내 콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
          status: error.response?.status ?? null,
        }))
      })

    return () => { active = false }
  }, [page, retry, sessionLoading, user])

  function retryLoad() {
    setList(previous => ({ ...previous, loading: true, error: '', status: null }))
    setRetry(value => value + 1)
  }

  if (sessionLoading) {
    return (
      <section className="my-channel-page">
        <h1>내 채널</h1>
        <p className="my-channel-message" role="status">회원 정보를 확인하고 있습니다.</p>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="my-channel-page">
        <h1>내 채널</h1>
        <p className="my-channel-message" role={sessionError ? 'alert' : undefined}>
          {sessionError || '내 콘텐츠를 보려면 로그인해주세요.'}
        </p>
        <Link to="/login">로그인하기</Link>
      </section>
    )
  }

  return (
    <section className="my-channel-page">
      <header className="my-channel-heading">
        <div>
          <h1>내 채널</h1>
          <p>내가 등록한 콘텐츠를 확인하고 관리할 수 있습니다.</p>
        </div>
        <Link className="my-channel-upload-button" to="/channel/upload">
          영상 등록
        </Link>
      </header>

      {list.loading && list.videos.length === 0 && (
        <p className="my-channel-message" role="status">콘텐츠를 불러오고 있습니다.</p>
      )}

      {list.error && (
        <div className="my-channel-error" role="alert">
          <p>{list.error}</p>
          {list.status === 401 && <Link to="/login">로그인하기</Link>}
          <button type="button" onClick={retryLoad}>다시 시도</button>
        </div>
      )}

      {!list.loading && !list.error && list.videos.length === 0 && (
        <p className="my-channel-message">아직 등록한 콘텐츠가 없습니다.</p>
      )}

      {list.videos.length > 0 && (
        <>
          <div className="my-channel-video-grid">
            {list.videos.map(video => (
              <article className="my-channel-video-card" key={video.videoId}>
                <img
                  src={video.thumbnailUrl || fallbackThumbnail}
                  alt={`${video.title} 썸네일`}
                  loading="lazy"
                  onError={event => {
                    if (event.currentTarget.src !== fallbackThumbnail) {
                      event.currentTarget.src = fallbackThumbnail
                    }
                  }}
                />
                <div className="my-channel-video-info">
                  <h2>{video.title}</h2>
                  <p>{video.categoryName} · {video.tagName}</p>
                  <p>조회수 {video.viewCount} · 좋아요 {video.likeCount}</p>
                  {video.status === 'HIDDEN' && (
                    <span className="my-channel-video-status">비공개</span>
                  )}
                </div>
              </article>
            ))}
          </div>

          {list.hasNext && (
            <button
              className="my-channel-more-button"
              type="button"
              disabled={list.loading}
              onClick={() => {
                setList(previous => ({ ...previous, loading: true, error: '' }))
                setPage(value => value + 1)
              }}
            >
              {list.loading ? '불러오는 중…' : '더 보기'}
            </button>
          )}
        </>
      )}

      <p className="my-channel-api-note">
        콘텐츠 수정·삭제는 현재 백엔드 API가 확인되지 않아 아직 연결되지 않았습니다.
      </p>
    </section>
  )
}
