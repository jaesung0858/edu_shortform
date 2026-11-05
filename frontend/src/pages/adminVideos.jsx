import { useMemo, useState } from 'react'
import fallbackThumbnail from '../assets/video.png'
import './adminVideos.css'

// These records are UI-only fixtures. They do not represent an API response.
const initialMockVideos = [
  {
    id: 'demo-1',
    title: 'SQL JOIN essentials in one minute',
    description: 'A short introduction to the difference between INNER JOIN and LEFT JOIN.',
    creator: 'Demo creator',
    category: 'Database',
    status: 'PUBLIC',
    views: 1840,
    likes: 126,
    createdAt: '2026-10-28',
  },
  {
    id: 'demo-2',
    title: 'React state management basics',
    description: 'Learn how component state updates the interface.',
    creator: 'Demo creator',
    category: 'Programming',
    status: 'HIDDEN',
    views: 936,
    likes: 72,
    createdAt: '2026-10-25',
  },
  {
    id: 'demo-3',
    title: 'Build a quick Excel summary table',
    description: 'A sample walkthrough for summarizing spreadsheet data.',
    creator: 'Demo creator',
    category: 'Productivity',
    status: 'PUBLIC',
    views: 2615,
    likes: 204,
    createdAt: '2026-10-21',
  },
]

const labels = {
  heading: '\uAD00\uB9AC\uC790 \uC601\uC0C1 \uAD00\uB9AC',
  subtitle: '\uB4F1\uB85D\uB41C \uC601\uC0C1 \uC815\uBCF4\uC640 \uACF5\uAC1C \uC0C1\uD0DC\uB97C \uD655\uC778\uD569\uB2C8\uB2E4.',
  mock: '\uBAA9\uC5C5 \uB370\uC774\uD130',
  notice: '\uC544\uB798 \uBAA9\uB85D\uACFC \uC218\uC815\u00B7\uC0C1\uD0DC \uBCC0\uACBD\u00B7\uC0AD\uC81C\uB294 \uD654\uBA74 \uD655\uC778\uC6A9 \uBAA9\uC5C5\uC785\uB2C8\uB2E4. \uC2E4\uC81C \uC11C\uBC84 \uB370\uC774\uD130\uB97C \uC870\uD68C\uD558\uAC70\uB098 \uBCC0\uACBD\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.',
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
  saveMock: '\uBAA9\uC5C5\uC5D0 \uC800\uC7A5',
  cancel: '\uCDE8\uC18C',
  close: '\uB2EB\uAE30',
  togglePublic: '\uACF5\uAC1C\uB85C \uC804\uD658',
  toggleHidden: '\uBE44\uACF5\uAC1C\uB85C \uC804\uD658',
  delete: '\uC0AD\uC81C',
  confirmDelete: '\uC601\uC0C1\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?',
  deleteDescription: '\uBAA9\uC5C5 \uBAA9\uB85D\uC5D0\uC11C\uB9CC \uC81C\uAC70\uB429\uB2C8\uB2E4. \uC11C\uBC84 \uB370\uC774\uD130\uB294 \uC0AD\uC81C\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.',
  empty: '\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4',
  emptyHint: '\uB2E4\uB978 \uC81C\uBAA9\uC73C\uB85C \uAC80\uC0C9\uD574 \uBCF4\uC138\uC694.',
  noDescription: '\uC124\uBA85 \uC5C6\uC74C',
}

function formatCount(value) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

export default function AdminVideos() {
  const [videos, setVideos] = useState(initialMockVideos)
  const [search, setSearch] = useState('')
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [draft, setDraft] = useState({ title: '', description: '' })
  const [editing, setEditing] = useState(false)
  const [deleteVideoId, setDeleteVideoId] = useState(null)
  const [notice, setNotice] = useState('')

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ko-KR')
    if (!query) return videos
    return videos.filter(video => video.title.toLocaleLowerCase('ko-KR').includes(query))
  }, [search, videos])

  const activeVideo = videos.find(video => video.id === activeVideoId)
  const pendingDeleteVideo = videos.find(video => video.id === deleteVideoId)

  function openDetails(video) {
    setActiveVideoId(video.id)
    setDraft({ title: video.title, description: video.description })
    setEditing(false)
  }

  function closeDetails() {
    setActiveVideoId(null)
    setEditing(false)
  }

  function saveDraft(event) {
    event.preventDefault()
    if (!activeVideo || !draft.title.trim()) return
    setVideos(current => current.map(video => (
      video.id === activeVideo.id
        ? { ...video, title: draft.title.trim(), description: draft.description.trim() }
        : video
    )))
    setEditing(false)
    setNotice('Mock item updated locally. No server data was changed.')
  }

  function toggleVisibility(video) {
    const nextStatus = video.status === 'PUBLIC' ? 'HIDDEN' : 'PUBLIC'
    setVideos(current => current.map(item => (
      item.id === video.id ? { ...item, status: nextStatus } : item
    )))
    setNotice('Mock visibility changed locally. No server data was changed.')
  }

  function confirmDelete() {
    if (!pendingDeleteVideo) return
    setVideos(current => current.filter(video => video.id !== pendingDeleteVideo.id))
    if (activeVideoId === pendingDeleteVideo.id) closeDetails()
    setDeleteVideoId(null)
    setNotice('Mock item removed from this page only. No server data was changed.')
  }

  return (
    <section className="admin-video-page">
      <header className="admin-video-heading">
        <div>
          <p className="admin-video-eyebrow">ADMIN</p>
          <h1>{labels.heading}</h1>
          <p className="admin-video-subtitle">{labels.subtitle}</p>
        </div>
        <span className="admin-video-demo-badge">{labels.mock}</span>
      </header>

      <aside className="admin-video-demo-notice" role="note">{labels.notice}</aside>

      <div className="admin-video-toolbar">
        <label className="admin-video-search-field">
          <span>{labels.search}</span>
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.search}
          />
        </label>
        <p className="admin-video-result-count" aria-live="polite">
          {labels.results} <strong>{filteredVideos.length}</strong>
        </p>
      </div>

      {notice && <p className="admin-video-action-notice" role="status" aria-live="polite">{notice}</p>}

      {filteredVideos.length > 0 ? (
        <div className="admin-video-grid">
          {filteredVideos.map(video => (
            <article className="admin-video-card" key={video.id}>
              <div className="admin-video-thumbnail-wrap">
                <img className="admin-video-thumbnail" src={fallbackThumbnail} alt="Mock video thumbnail" />
                <span className={`admin-video-status admin-video-status--${video.status.toLowerCase()}`}>
                  {video.status === 'PUBLIC' ? labels.public : labels.hidden}
                </span>
              </div>
              <div className="admin-video-card-body">
                <div className="admin-video-card-heading">
                  <h2>{video.title}</h2>
                  <p>{video.creator} · {video.category}</p>
                </div>
                <p className="admin-video-description">{video.description}</p>
                <div className="admin-video-metadata">
                  <span>{labels.views} {formatCount(video.views)}</span>
                  <span>{labels.likes} {formatCount(video.likes)}</span>
                  <span>{video.createdAt}</span>
                </div>
                <div className="admin-video-card-actions">
                  <button className="btn-secondary" type="button" onClick={() => openDetails(video)}>{labels.details}</button>
                  <button className="btn-secondary" type="button" onClick={() => toggleVisibility(video)}>
                    {video.status === 'PUBLIC' ? labels.toggleHidden : labels.togglePublic}
                  </button>
                  <button className="btn-danger" type="button" onClick={() => setDeleteVideoId(video.id)}>{labels.delete}</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-video-empty-state">
          <h2>{labels.empty}</h2>
          <p>{labels.emptyHint}</p>
        </div>
      )}

      {activeVideo && (
        <div className="admin-video-modal-backdrop" onMouseDown={event => {
          if (event.target === event.currentTarget) closeDetails()
        }}>
          <section className="admin-video-modal" role="dialog" aria-modal="true" aria-labelledby="admin-video-detail-title">
            <div className="admin-video-modal-heading">
              <div>
                <p className="admin-video-eyebrow">VIDEO DETAILS</p>
                <h2 id="admin-video-detail-title">{labels.details}</h2>
              </div>
              <button className="btn-secondary" type="button" onClick={closeDetails}>{labels.close}</button>
            </div>
            {editing ? (
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
                  <button className="btn-secondary" type="button" onClick={() => setEditing(false)}>{labels.cancel}</button>
                  <button className="btn-primary" type="submit">{labels.saveMock}</button>
                </div>
              </form>
            ) : (
              <>
                <dl className="admin-video-detail-list">
                  <div><dt>{labels.title}</dt><dd>{activeVideo.title}</dd></div>
                  <div><dt>{labels.description}</dt><dd>{activeVideo.description || labels.noDescription}</dd></div>
                  <div><dt>{labels.creator}</dt><dd>{activeVideo.creator}</dd></div>
                  <div><dt>{labels.category}</dt><dd>{activeVideo.category}</dd></div>
                  <div><dt>{labels.status}</dt><dd>{activeVideo.status === 'PUBLIC' ? labels.public : labels.hidden}</dd></div>
                  <div><dt>{labels.createdAt}</dt><dd>{activeVideo.createdAt}</dd></div>
                  <div><dt>{labels.views} / {labels.likes}</dt><dd>{formatCount(activeVideo.views)} / {formatCount(activeVideo.likes)}</dd></div>
                </dl>
                <div className="admin-video-modal-actions">
                  <button className="btn-secondary" type="button" onClick={() => setEditing(true)}>{labels.edit}</button>
                  <button className="btn-secondary" type="button" onClick={() => toggleVisibility(activeVideo)}>
                    {activeVideo.status === 'PUBLIC' ? labels.toggleHidden : labels.togglePublic}
                  </button>
                  <button className="btn-danger" type="button" onClick={() => setDeleteVideoId(activeVideo.id)}>{labels.delete}</button>
                </div>
              </>
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
            <div className="admin-video-modal-actions">
              <button className="btn-secondary" type="button" onClick={() => setDeleteVideoId(null)}>{labels.cancel}</button>
              <button className="btn-danger" type="button" onClick={confirmDelete}>{labels.delete}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
