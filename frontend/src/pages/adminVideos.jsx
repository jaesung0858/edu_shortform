import { useEffect, useRef, useState } from 'react'
import {
  deleteAdminVideo,
  getAdminVideo,
  getAdminVideos,
  updateAdminVideo,
} from '../api/adminVideos'
import fallbackThumbnail from '../assets/video.png'
import './adminVideos.css'

const labels = {
  heading: '\uAD00\uB9AC\uC790 \uC601\uC0C1 \uAD00\uB9AC',
  subtitle: '\uB4F1\uB85D\uB41C \uC601\uC0C1 \uC815\uBCF4\uC640 \uACF5\uAC1C \uC0C1\uD0DC\uB97C \uD655\uC778\uD569\uB2C8\uB2E4.',
  search: '\uC601\uC0C1 \uC81C\uBAA9 \uAC80\uC0C9',
  searchPlaceholder: '\uAC80\uC0C9\uD560 \uC81C\uBAA9\uC744 \uC785\uB825\uD558\uC138\uC694',
  results: '\uAC80\uC0C9 \uACB0\uACFC',
  public: '\uACF5\uAC1C',
  hidden: '\uBE44\uACF5\uAC1C',
  details: '\uC0C1\uC138 \uC815\uBCF4',
  edit: '\uC218\uC815',
  title: '\uC81C\uBAA9',
  description: '\uC124\uBA85',
  creator: '\uC791\uC131\uC790',
  category: '\uCE74\uD14C\uACE0\uB9AC',
  status: '\uC0C1\uD0DC',
  createdAt: '\uB4F1\uB85D\uC77C',
  views: '\uC870\uD68C',
  likes: '\uC88B\uC544\uC694',
  save: '\uC800\uC7A5',
  cancel: '\uCDE8\uC18C',
  close: '\uB2EB\uAE30',
  togglePublic: '\uACF5\uAC1C\uB85C \uC804\uD658',
  toggleHidden: '\uBE44\uACF5\uAC1C\uB85C \uC804\uD658',
  delete: '\uC0AD\uC81C',
  confirmDelete: '\uC601\uC0C1\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?',
  deleteDescription: '\uC774 \uC791\uC5C5\uC740 \uC11C\uBC84\uC5D0 \uBC18\uC601\uB429\uB2C8\uB2E4.',
  empty: '\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4',
  emptyHint: '\uB2E4\uB978 \uC81C\uBAA9\uC73C\uB85C \uAC80\uC0C9\uD574 \uBCF4\uC138\uC694.',
  loading: '\uC601\uC0C1 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4.',
  detailLoading: '\uC0C1\uC138 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4.',
  previous: '\uC774\uC804',
  next: '\uB2E4\uC74C',
  retry: '\uB2E4\uC2DC \uC2DC\uB3C4',
  page: '\uD398\uC774\uC9C0',
  saved: '\uC601\uC0C1 \uC815\uBCF4\uB97C \uC218\uC815\uD588\uC2B5\uB2C8\uB2E4.',
  statusChanged: '\uACF5\uAC1C \uC0C1\uD0DC\uB97C \uBCC0\uACBD\uD588\uC2B5\uB2C8\uB2E4.',
  deleted: '\uC601\uC0C1\uC744 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.',
  unauthorized: '\uB85C\uADF8\uC778 \uC138\uC158\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
  forbidden: '\uAD00\uB9AC\uC790 \uAD8C\uD55C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
  notFound: '\uC694\uCCAD\uD55C \uC601\uC0C1\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
  loadError: '\uC601\uC0C1 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
}

function getErrorMessage(error) {
  const status = error.response?.status
  if (status === 401) return labels.unauthorized
  if (status === 403) return labels.forbidden
  if (status === 404) return labels.notFound
  return labels.loadError
}

function formatCount(value) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('ko-KR')
}

export default function AdminVideos() {
  const [list, setList] = useState({ videos: [], hasNext: false, loading: true, error: '' })
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [keyword, setKeyword] = useState('')
  const [retry, setRetry] = useState(0)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [draft, setDraft] = useState({ title: '', description: '' })
  const [editing, setEditing] = useState(false)
  const [deleteVideoId, setDeleteVideoId] = useState(null)
  const [busyVideoId, setBusyVideoId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const mutationLock = useRef(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(search.trim())
      setPage(0)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    setList(previous => ({ ...previous, loading: true, error: '' }))

    getAdminVideos(page, keyword, { signal: controller.signal })
      .then(data => {
        if (active) {
          setList({ videos: data.videos, hasNext: data.hasNext, loading: false, error: '' })
        }
      })
      .catch(error => {
        if (active) {
          setList(previous => ({ ...previous, loading: false, error: getErrorMessage(error) }))
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [page, keyword, retry])

  useEffect(() => {
    if (activeVideoId === null) return undefined
    const controller = new AbortController()
    let active = true
    setDetailLoading(true)
    setDetailError('')

    getAdminVideo(activeVideoId, { signal: controller.signal })
      .then(video => {
        if (active) {
          setActiveVideo(video)
          setDraft({ title: video.title, description: video.description ?? '' })
        }
      })
      .catch(error => {
        if (active) setDetailError(getErrorMessage(error))
      })
      .finally(() => {
        if (active) setDetailLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [activeVideoId])

  const pendingDeleteVideo = list.videos.find(video => video.videoId === deleteVideoId)

  function closeDetails() {
    setActiveVideoId(null)
    setActiveVideo(null)
    setEditing(false)
    setDetailError('')
  }

  function openDetails(video) {
    setActiveVideoId(video.videoId)
    setActiveVideo(null)
    setDetailError('')
    setEditing(false)
  }

  function applyVideoUpdate(video) {
    setActiveVideo(video)
    setList(previous => ({
      ...previous,
      videos: previous.videos.map(item => (
        item.videoId === video.videoId ? { ...item, ...video } : item
      )),
    }))
  }

  async function refreshList() {
    setList(previous => ({ ...previous, loading: true, error: '' }))
    try {
      const data = await getAdminVideos(page, keyword)
      if (data.videos.length === 0 && page > 0) {
        setPage(value => Math.max(0, value - 1))
        return
      }
      setList({ videos: data.videos, hasNext: data.hasNext, loading: false, error: '' })
    } catch (error) {
      setList(previous => ({ ...previous, loading: false, error: getErrorMessage(error) }))
    }
  }

  async function saveDraft(event) {
    event.preventDefault()
    if (mutationLock.current || activeVideoId === null || !draft.title.trim()) return
    mutationLock.current = true
    setBusyVideoId(activeVideoId)
    setActionError('')
    setNotice('')
    try {
      const updated = await updateAdminVideo(activeVideoId, {
        title: draft.title.trim(),
        description: draft.description.trim(),
      })
      applyVideoUpdate(updated)
      setDraft({ title: updated.title, description: updated.description ?? '' })
      setEditing(false)
      setNotice(labels.saved)
      await refreshList()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      mutationLock.current = false
      setBusyVideoId(null)
    }
  }

  async function toggleVisibility(video) {
    if (mutationLock.current) return
    mutationLock.current = true
    setBusyVideoId(video.videoId)
    setActionError('')
    setNotice('')
    try {
      const updated = await updateAdminVideo(video.videoId, {
        status: video.status === 'PUBLIC' ? 'HIDDEN' : 'PUBLIC',
      })
      applyVideoUpdate(updated)
      setNotice(labels.statusChanged)
      await refreshList()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      mutationLock.current = false
      setBusyVideoId(null)
    }
  }

  async function confirmDelete() {
    if (mutationLock.current || deleteVideoId === null) return
    mutationLock.current = true
    setDeleting(true)
    setActionError('')
    setNotice('')
    try {
      await deleteAdminVideo(deleteVideoId)
      if (activeVideoId === deleteVideoId) closeDetails()
      setDeleteVideoId(null)
      setNotice(labels.deleted)
      await refreshList()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      mutationLock.current = false
      setDeleting(false)
    }
  }

  function cancelEdit() {
    if (activeVideo) {
      setDraft({ title: activeVideo.title, description: activeVideo.description ?? '' })
    }
    setEditing(false)
  }

  return (
    <section className="admin-video-page">
      <header className="admin-video-heading">
        <div>
          <p className="admin-video-eyebrow">ADMIN</p>
          <h1>{labels.heading}</h1>
          <p className="admin-video-subtitle">{labels.subtitle}</p>
        </div>
      </header>

      <div className="admin-video-toolbar">
        <label className="admin-video-search-field">
          <span>{labels.search}</span>
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.search}
            maxLength={100}
          />
        </label>
        <p className="admin-video-result-count" aria-live="polite">
          {labels.results} <strong>{list.videos.length}</strong>
        </p>
      </div>

      {notice && <p className="admin-video-action-notice" role="status" aria-live="polite">{notice}</p>}
      {actionError && <p className="admin-video-action-notice" role="alert">{actionError}</p>}
      {list.error && (
        <div className="admin-video-empty-state" role="alert">
          <p>{list.error}</p>
          <button className="btn-secondary" type="button" onClick={() => setRetry(value => value + 1)}>
            {labels.retry}
          </button>
        </div>
      )}
      {list.loading && <p className="admin-video-action-notice" role="status">{labels.loading}</p>}

      {!list.loading && !list.error && list.videos.length > 0 && (
        <div className="admin-video-grid">
          {list.videos.map(video => (
            <article className="admin-video-card" key={video.videoId}>
              <div className="admin-video-thumbnail-wrap">
                <img
                  className="admin-video-thumbnail"
                  src={video.thumbnailUrl || fallbackThumbnail}
                  alt="Video thumbnail"
                  onError={event => {
                    if (event.currentTarget.src !== fallbackThumbnail) event.currentTarget.src = fallbackThumbnail
                  }}
                />
                <span className={`admin-video-status admin-video-status--${video.status.toLowerCase()}`}>
                  {video.status === 'PUBLIC' ? labels.public : labels.hidden}
                </span>
              </div>
              <div className="admin-video-card-body">
                <div className="admin-video-card-heading">
                  <h2>{video.title}</h2>
                  <p>{video.creatorNickname} · {video.categoryName} · {video.tagName}</p>
                </div>
                <div className="admin-video-metadata">
                  <span>{labels.views} {formatCount(video.viewCount)}</span>
                  <span>{labels.likes} {formatCount(video.likeCount)}</span>
                  <span>{formatDate(video.createdAt)}</span>
                </div>
                <div className="admin-video-card-actions">
                  <button className="btn-secondary" type="button" disabled={busyVideoId !== null || deleting} onClick={() => openDetails(video)}>
                    {labels.details}
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    disabled={busyVideoId !== null || deleting}
                    onClick={() => toggleVisibility(video)}
                  >
                    {video.status === 'PUBLIC' ? labels.toggleHidden : labels.togglePublic}
                  </button>
                  <button className="btn-danger" type="button" disabled={busyVideoId !== null || deleting} onClick={() => setDeleteVideoId(video.videoId)}>
                    {labels.delete}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!list.loading && !list.error && list.videos.length === 0 && (
        <div className="admin-video-empty-state">
          <h2>{labels.empty}</h2>
          <p>{labels.emptyHint}</p>
        </div>
      )}

      {!list.error && (page > 0 || list.hasNext) && (
        <div className="admin-video-pagination">
          <button
            className="btn-secondary"
            type="button"
            disabled={list.loading || page === 0}
            onClick={() => setPage(value => Math.max(0, value - 1))}
          >
            {labels.previous}
          </button>
          <span>{labels.page} {page + 1}</span>
          <button
            className="btn-secondary"
            type="button"
            disabled={list.loading || !list.hasNext}
            onClick={() => setPage(value => value + 1)}
          >
            {labels.next}
          </button>
        </div>
      )}

      {activeVideoId !== null && (
        <div className="admin-video-modal-backdrop" onMouseDown={event => {
          if (event.target === event.currentTarget) closeDetails()
        }}>
          <section className="admin-video-modal" role="dialog" aria-modal="true" aria-labelledby="admin-video-detail-title">
            <div className="admin-video-modal-heading">
              <div>
                <p className="admin-video-eyebrow">VIDEO DETAILS</p>
                <h2 id="admin-video-detail-title">{labels.details}</h2>
              </div>
            <button className="btn-secondary" type="button" disabled={busyVideoId !== null || deleting} onClick={closeDetails}>{labels.close}</button>
            </div>
            {detailLoading && <p role="status">{labels.detailLoading}</p>}
            {detailError && <p role="alert">{detailError}</p>}
            {actionError && <p className="admin-video-action-notice" role="alert">{actionError}</p>}
            {!detailLoading && activeVideo && (
              editing ? (
                <form className="admin-video-edit-form" onSubmit={saveDraft}>
                  <label className="admin-video-search-field">
                    <span>{labels.title}</span>
                    <input
                      type="text"
                      value={draft.title}
                      maxLength={100}
                      required
                      onChange={event => setDraft(current => ({ ...current, title: event.target.value }))}
                    />
                  </label>
                  <label className="admin-video-search-field">
                    <span>{labels.description}</span>
                    <textarea
                      value={draft.description}
                      rows={5}
                      maxLength={1000}
                      onChange={event => setDraft(current => ({ ...current, description: event.target.value }))}
                    />
                  </label>
                  <div className="admin-video-modal-actions">
                    <button className="btn-secondary" type="button" disabled={busyVideoId !== null} onClick={cancelEdit}>
                      {labels.cancel}
                    </button>
                    <button className="btn-primary" type="submit" disabled={busyVideoId !== null}>
                      {labels.save}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <dl className="admin-video-detail-list">
                    <div><dt>{labels.title}</dt><dd>{activeVideo.title}</dd></div>
                    <div><dt>{labels.description}</dt><dd>{activeVideo.description || '\uC124\uBA85 \uC5C6\uC74C'}</dd></div>
                    <div><dt>{labels.creator}</dt><dd>{activeVideo.creatorNickname}</dd></div>
                    <div><dt>{labels.category}</dt><dd>{activeVideo.categoryName} · {activeVideo.tagName}</dd></div>
                    <div><dt>{labels.status}</dt><dd>{activeVideo.status === 'PUBLIC' ? labels.public : labels.hidden}</dd></div>
                    <div><dt>{labels.views} / {labels.likes}</dt><dd>{formatCount(activeVideo.viewCount)} / {formatCount(activeVideo.likeCount)}</dd></div>
                    <div><dt>Duration</dt><dd>{activeVideo.durationSec}s</dd></div>
                  </dl>
                  <div className="admin-video-modal-actions">
                    <button className="btn-secondary" type="button" disabled={busyVideoId !== null || deleting} onClick={() => setEditing(true)}>{labels.edit}</button>
                    <button
                      className="btn-secondary"
                      type="button"
                      disabled={busyVideoId !== null || deleting}
                      onClick={() => toggleVisibility(activeVideo)}
                    >
                      {activeVideo.status === 'PUBLIC' ? labels.toggleHidden : labels.togglePublic}
                    </button>
                    <button className="btn-danger" type="button" disabled={busyVideoId !== null || deleting} onClick={() => setDeleteVideoId(activeVideoId)}>
                      {labels.delete}
                    </button>
                  </div>
                </>
              )
            )}
          </section>
        </div>
      )}

      {pendingDeleteVideo && (
        <div className="admin-video-modal-backdrop admin-video-modal-backdrop--confirm">
          <section
            className="admin-video-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-video-delete-title"
            aria-describedby="admin-video-delete-description"
          >
            <p className="admin-video-eyebrow">DELETE VIDEO</p>
            <h2 id="admin-video-delete-title">{labels.confirmDelete}</h2>
            <p id="admin-video-delete-description">
              <strong>{pendingDeleteVideo.title}</strong> — {labels.deleteDescription}
            </p>
            {actionError && <p className="admin-video-action-notice" role="alert">{actionError}</p>}
            <div className="admin-video-modal-actions">
              <button className="btn-secondary" type="button" disabled={deleting} onClick={() => setDeleteVideoId(null)}>
                {labels.cancel}
              </button>
              <button className="btn-danger" type="button" disabled={deleting} onClick={confirmDelete}>
                {labels.delete}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
