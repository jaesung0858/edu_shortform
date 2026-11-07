import { useEffect, useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { deleteMyVideo, getMyVideos, getVideo, updateMyVideo } from '../api/videos'
import fallbackThumbnail from '../assets/video.png'
import './myChannel.css'

function getActionErrorMessage(error, action) {
  const status = error.response?.status
  if (status === 400) return '입력한 제목, 설명 또는 공개 상태를 확인해주세요.'
  if (status === 401) return '로그인 세션이 만료되었습니다. 다시 로그인해주세요.'
  if (status === 403) return '본인이 등록한 영상만 수정하거나 삭제할 수 있습니다.'
  if (status === 404) return '영상을 찾을 수 없습니다. 목록을 새로고침해주세요.'
  return action === 'load'
    ? '영상 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
    : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.'
}

export default function MyChannel() {
  const { user, loading: sessionLoading, error: sessionError } = useOutletContext()
  const [page, setPage] = useState(0)
  const [retry, setRetry] = useState(0)
  const [editingVideo, setEditingVideo] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionNotice, setActionNotice] = useState('')
  const actionLockRef = useRef(false)
  const editRequestRef = useRef(0)
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

  function refreshList() {
    setList(previous => ({ ...previous, loading: true, error: '', status: null }))
    setPage(0)
    setRetry(value => value + 1)
  }

  async function openEditor(video) {
    const requestId = editRequestRef.current + 1
    editRequestRef.current = requestId
    setActionNotice('')
    setEditingVideo({
      videoId: video.videoId,
      title: '',
      description: '',
      status: video.status,
      loading: true,
      saving: false,
      error: '',
    })

    try {
      const detail = await getVideo(video.videoId)
      if (editRequestRef.current !== requestId) return
      setEditingVideo({
        videoId: video.videoId,
        title: detail.title ?? '',
        description: detail.description ?? '',
        status: detail.status,
        loading: false,
        saving: false,
        error: '',
      })
    } catch (error) {
      if (editRequestRef.current !== requestId) return
      setEditingVideo(previous => ({
        ...previous,
        loading: false,
        error: getActionErrorMessage(error, 'load'),
      }))
    }
  }

  function closeEditor() {
    if (editingVideo?.saving) return
    editRequestRef.current += 1
    setEditingVideo(null)
  }

  async function handleUpdate(event) {
    event.preventDefault()
    if (!editingVideo || editingVideo.loading || editingVideo.saving || actionLockRef.current) return

    const title = editingVideo.title.trim()
    if (!title) {
      setEditingVideo(previous => ({ ...previous, error: '제목을 입력해주세요.' }))
      return
    }
    if (title.length > 100 || editingVideo.description.length > 1000) {
      setEditingVideo(previous => ({ ...previous, error: '제목은 100자, 설명은 1,000자 이내로 입력해주세요.' }))
      return
    }

    actionLockRef.current = true
    setEditingVideo(previous => ({ ...previous, saving: true, error: '' }))
    try {
      await updateMyVideo(editingVideo.videoId, {
        title,
        description: editingVideo.description,
        status: editingVideo.status,
      })
      setEditingVideo(null)
      setActionNotice('영상 정보가 수정되었습니다.')
      refreshList()
    } catch (error) {
      setEditingVideo(previous => previous && ({
        ...previous,
        saving: false,
        error: getActionErrorMessage(error, 'update'),
      }))
    } finally {
      actionLockRef.current = false
    }
  }

  async function handleDelete() {
    if (!deleteTarget || deleteTarget.deleting || actionLockRef.current) return

    actionLockRef.current = true
    setDeleteTarget(previous => ({ ...previous, deleting: true, error: '' }))
    try {
      await deleteMyVideo(deleteTarget.videoId)
      setDeleteTarget(null)
      setActionNotice('영상이 삭제되었습니다.')
      refreshList()
    } catch (error) {
      setDeleteTarget(previous => previous && ({
        ...previous,
        deleting: false,
        error: getActionErrorMessage(error, 'delete'),
      }))
    } finally {
      actionLockRef.current = false
    }
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

      {actionNotice && <p className="my-channel-action-notice" role="status">{actionNotice}</p>}

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
                  <div className="my-channel-video-actions">
                    <button
                      className="my-channel-edit-button"
                      type="button"
                      disabled={list.loading || actionLockRef.current}
                      onClick={() => openEditor(video)}
                    >
                      수정
                    </button>
                    <button
                      className="my-channel-delete-button"
                      type="button"
                      disabled={list.loading || actionLockRef.current}
                      onClick={() => {
                        setActionNotice('')
                        setDeleteTarget({ videoId: video.videoId, title: video.title, deleting: false, error: '' })
                      }}
                    >
                      삭제
                    </button>
                  </div>
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

      {editingVideo && (
        <div className="my-channel-dialog-backdrop">
          <section
            className="my-channel-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="my-channel-edit-title"
          >
            <form onSubmit={handleUpdate}>
              <h2 id="my-channel-edit-title">영상 수정</h2>
              {editingVideo.loading ? (
                <p className="my-channel-dialog-message" role="status">영상 정보를 불러오고 있습니다.</p>
              ) : (
                <>
                  <label className="my-channel-field">
                    <span>제목</span>
                    <input
                      type="text"
                      value={editingVideo.title}
                      maxLength={100}
                      required
                      onChange={event => setEditingVideo(previous => ({ ...previous, title: event.target.value, error: '' }))}
                    />
                  </label>
                  <label className="my-channel-field">
                    <span>설명</span>
                    <textarea
                      value={editingVideo.description}
                      maxLength={1000}
                      rows={5}
                      onChange={event => setEditingVideo(previous => ({ ...previous, description: event.target.value, error: '' }))}
                    />
                  </label>
                  <label className="my-channel-field">
                    <span>공개 상태</span>
                    <select
                      value={editingVideo.status}
                      onChange={event => setEditingVideo(previous => ({ ...previous, status: event.target.value, error: '' }))}
                    >
                      <option value="PUBLIC">공개</option>
                      <option value="HIDDEN">비공개</option>
                    </select>
                  </label>
                </>
              )}
              {editingVideo.error && <p className="my-channel-dialog-error" role="alert">{editingVideo.error}</p>}
              <div className="my-channel-dialog-actions">
                <button
                  className="my-channel-dialog-secondary"
                  type="button"
                  disabled={editingVideo.saving}
                  onClick={closeEditor}
                >
                  취소
                </button>
                <button
                  className="my-channel-dialog-primary"
                  type="submit"
                  disabled={editingVideo.loading || editingVideo.saving}
                >
                  {editingVideo.saving ? '저장 중…' : '변경 저장'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="my-channel-dialog-backdrop">
          <section
            className="my-channel-dialog my-channel-delete-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="my-channel-delete-title"
          >
            <h2 id="my-channel-delete-title">영상을 삭제할까요?</h2>
            <p>“{deleteTarget.title}” 영상이 내 채널에서 삭제됩니다.</p>
            {deleteTarget.error && <p className="my-channel-dialog-error" role="alert">{deleteTarget.error}</p>}
            <div className="my-channel-dialog-actions">
              <button
                className="my-channel-dialog-secondary"
                type="button"
                disabled={deleteTarget.deleting}
                onClick={() => setDeleteTarget(null)}
              >
                취소
              </button>
              <button
                className="my-channel-dialog-danger"
                type="button"
                disabled={deleteTarget.deleting}
                onClick={handleDelete}
              >
                {deleteTarget.deleting ? '삭제 중…' : '삭제'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
