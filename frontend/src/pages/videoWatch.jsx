import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getVideo } from '../api/videos'
import './videoWatch.css'

export default function VideoWatch() {
  const { videoId } = useParams()
  return <VideoContent key={videoId} videoId={videoId} />
}

function VideoContent({ videoId }) {
  const [state, setState] = useState({ loading: true, video: null, error: '' })
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    getVideo(videoId)
      .then(video => active && setState({ loading: false, video, error: '' }))
      .catch(error => active && setState({ loading: false, video: null,
        error: error.response?.status === 404 ? '영상을 찾을 수 없습니다.' : '영상을 불러오지 못했습니다.' }))
    return () => { active = false }
  }, [videoId])

  return <section className="watch-page">
    <Link to="/explore">영상 목록</Link>
    {state.loading && <p role="status">영상을 불러오고 있습니다.</p>}
    {state.error && <p role="alert">{state.error}</p>}
    {state.video && <>
      <h2>{state.video.title}</h2>
      {state.video.status === 'HIDDEN' && <p>숨김 영상입니다. 작성자에게만 표시됩니다.</p>}
      {failed ? <p role="alert">영상 파일을 재생할 수 없습니다. 저장된 파일이나 영상 형식을 확인해주세요.</p>
        : <video src={state.video.videoUrl} controls autoPlay muted playsInline preload="metadata"
            aria-label={state.video.title} onError={() => setFailed(true)} />}
      <p>{state.video.creatorNickname}</p>
      <p>{state.video.categoryName} · {state.video.tagName}</p>
      {state.video.description && <p className="watch-description">{state.video.description}</p>}
    </>}
  </section>
}
