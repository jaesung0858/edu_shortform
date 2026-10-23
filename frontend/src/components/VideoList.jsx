import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyVideos, getVideos } from '../api/videos'
import thumbnail from '../assets/video.png'
import './VideoList.css'

export default function VideoList({ showCategories = false, mine = false }) {
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(0)
  const [retry, setRetry] = useState(0)
  const [list, setList] = useState({ videos: [], categories: [], hasNext: false, loading: true, error: '' })

  useEffect(() => {
    let active = true
    const request = mine ? getMyVideos(page) : getVideos(page, categoryId)
    request
      .then(data => {
        if (!active) return
        setList(previous => ({
          videos: page === 0 ? data.videos : [...previous.videos, ...data.videos],
          categories: data.categories,
          hasNext: data.hasNext,
          loading: false,
          error: '',
        }))
      })
      .catch(error => {
        if (active) setList(previous => ({ ...previous, loading: false,
          error: error.response?.status === 401 ? '다시 로그인해주세요.' : '영상 목록을 불러오지 못했습니다.' }))
      })
    return () => { active = false }
  }, [page, categoryId, retry, mine])

  function selectCategory(value) {
    if (value === categoryId) return
    setCategoryId(value)
    setPage(0)
    setList(previous => ({ ...previous, videos: [], loading: true, error: '' }))
  }

  return (
    <div className="video-list">
      {showCategories && <div className="category" aria-label="영상 카테고리">
        <button type="button" aria-pressed={categoryId === ''} disabled={list.loading} onClick={() => selectCategory('')}>전체</button>
        {list.categories.map(category => (
          <button key={category.categoryId} type="button" disabled={list.loading}
            aria-pressed={categoryId === String(category.categoryId)} onClick={() => selectCategory(String(category.categoryId))}>
            {category.name}
          </button>
        ))}
      </div>}
      <div className="video-zone">
        {list.videos.map(video => (
          <Link className="video" key={video.videoId} to={`/videos/${video.videoId}`}>
            <img src={thumbnail} alt="영상 기본 썸네일" />
            <h3>{video.title}</h3>
            <p>조회수: {video.viewCount}</p><p>좋아요: {video.likeCount}</p>
            <h4>{video.creatorNickname}</h4>
            <p>{video.categoryName} · {video.tagName}</p>
            {mine && video.status === 'HIDDEN' && <p>숨김 영상</p>}
          </Link>
        ))}
      </div>
      {list.loading && <p role="status">영상 목록을 불러오고 있습니다.</p>}
      {list.error && <div role="alert">
        <p>{list.error}</p>
        <button type="button" onClick={() => {
          setList(previous => ({ ...previous, loading: true, error: '' }))
          setRetry(value => value + 1)
        }}>다시 시도</button>
      </div>}
      {!list.loading && !list.error && list.videos.length === 0 && <p>{mine ? '아직 올린 영상이 없습니다.' : '등록된 영상이 없습니다.'}</p>}
      {list.hasNext && !list.error && <button type="button" disabled={list.loading} onClick={() => {
        setList(previous => ({ ...previous, loading: true, error: '' }))
        setPage(value => value + 1)
      }}>더 보기</button>}
    </div>
  )
}
