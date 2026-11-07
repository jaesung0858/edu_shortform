import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getVideo } from '../api/videos'
import {
  getLikeStatus,
  likeVideo,
  unlikeVideo
} from '../api/like'
import { useRef } from 'react'
import { increaseView } from '../api/view'
import './videoWatch.css'

export default function VideoWatch() {
  const { videoId } = useParams()
  return <VideoContent key={videoId} videoId={videoId} />
}

function VideoContent({ videoId }) {
  const [state, setState] = useState({ loading: true, video: null, error: '' })
  const [failed, setFailed] = useState(false)
  const [likeState, setLikeState] = useState({
    liked: false,
    likeCount: 0,
    loading: true
  })
  const [likeLoading, setLikeLoading] = useState(false)
  const viewCounted = useRef(false)

  useEffect(() => {
    let active = true
    getVideo(videoId)
      .then(video => {
        if (!active) return

        setState({
          loading: false,
          video,
          error: ''
        })

        setLikeState(previous => ({
          ...previous,
          likeCount: video.likeCount
        }))
      })
      .catch(error => active && setState({ loading: false, video: null,
        error: error.response?.status === 404 ? '영상을 찾을 수 없습니다.' : '영상을 불러오지 못했습니다.' }))
    return () => { active = false }
  }, [videoId])

  useEffect(() => {
    let active = true

    getLikeStatus(videoId)
      .then(data => {
        if (active) {
          setLikeState({
            liked: data.liked,
            likeCount: data.likeCount,
            loading: false
          })
        }
      })
      .catch(() => {
        if (active) {
          setLikeState(previous => ({
            ...previous,
            liked: false,
            loading: false
          }))
        }
      })

    return () => {
      active = false
    }
  }, [videoId])
  
  async function handleLike() {
    if (likeLoading) return

    setLikeLoading(true)

    try {
      const data = likeState.liked
        ? await unlikeVideo(videoId)
        : await likeVideo(videoId)

      setLikeState({
        liked: data.liked,
        likeCount: data.likeCount,
        loading: false
      })
    } catch (error) {
        alert(error.message)

    } finally {
      setLikeLoading(false)
    }
  }

  return <section className="watch-page">
    <Link to="/explore">영상 목록</Link>
    {state.loading && <p role="status">영상을 불러오고 있습니다.</p>}
    {state.error && <p role="alert">{state.error}</p>}
    {state.video && <>
      <h2>{state.video.title}</h2>
      {state.video.status === 'HIDDEN' && <p>숨김 영상입니다. 작성자에게만 표시됩니다.</p>}
      {failed ? <p role="alert">영상 파일을 재생할 수 없습니다. 저장된 파일이나 영상 형식을 확인해주세요.</p>
        : <video
            src={state.video.videoUrl}
            poster={state.video.thumbnailUrl || undefined}
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            aria-label={state.video.title}
            onError={() => setFailed(true)}
            onPlay={async () => {
              if (viewCounted.current) return

              viewCounted.current = true

              try {
                const data = await increaseView(videoId)
                console.log('조회수 증가:', data)
              } catch (error) {
                console.error(error.message)
              }
            }}
          />}
      <p>{state.video.creatorNickname}</p>
      <p>{state.video.categoryName} · {state.video.tagName}</p>
      <button
        type="button"
        className={`like-button ${likeState.liked ? 'liked' : ''}`}
        onClick={handleLike}
        disabled={likeLoading || likeState.loading}
        aria-pressed={likeState.liked}
      >
        {likeState.liked ? '♥' : '♡'} {likeState.likeCount}
      </button>
      {state.video.description && <p className="watch-description">{state.video.description}</p>}
    </>}
  </section>
}
