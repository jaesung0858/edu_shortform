import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import {
  getVideoCategories,
  createVideoCategory,
  createVideoTag,
  uploadVideo,
} from '../../../api/videos'

import {
  ACCEPT_VIDEO_TYPES,
  MAX_VIDEO_BYTES,
  toUploadErrorMessage,
} from '../api/videoUploadApi'
import QuizFields from '../components/QuizFields'
import '../videoUpload.css'

// DB README: 영상당 퀴즈 1~2문항
const MAX_QUIZZES = 2
const MY_CHANNEL_PATH = '/myChannel'
const emptyQuiz = () => ({ question: '', options: ['', '', '', ''], answerNo: 0, explanation: '' })

const isQuizFilled = (q) => q.question.trim() && q.options.every((o) => o.trim()) && q.answerNo >= 1 && q.answerNo <= 4

function isMp4(file) {
  return file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')
}

// 미리보기 영상의 한 장면을 긴 변 480px JPEG로 캡처한다. 서버는 1MB·1920px 이하 JPEG만 받는다.
function captureThumbnail(video) {
  const scale = Math.min(1, 480 / Math.max(video.videoWidth, video.videoHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(video.videoWidth * scale)
  canvas.height = Math.round(video.videoHeight * scale)
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
}

// /channel/upload — 영상 파일 선택(미리보기) → 정보·퀴즈 입력 → 등록 → 내 채널로 이동
export default function VideoUploadPage() {
  const navigate = useNavigate()
  const {
    user,
    loading,
    error: sessionError
  } = useOutletContext()
  const [categories, setCategories] = useState({ status: 'loading', list: [] })
  const [creator, setCreator] = useState({
    kind: '',
    name: '',
    pending: false,
    error: '',
  })

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [durationSec, setDurationSec] = useState(0)
  const [thumbnail, setThumbnail] = useState(null)
  const [fileError, setFileError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagId, setTagId] = useState('')
  const [quizzes, setQuizzes] = useState([emptyQuiz()])

  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const thumbnailTaken = useRef(false)
  const redirectTimer = useRef(null)

  useEffect(() => {
    let ignore = false
    getVideoCategories()
      .then((list) => !ignore && setCategories({ status: 'ready', list }))
      .catch((e) => !ignore && setCategories({ status: 'error', list: [], message: toUploadErrorMessage(e) }))
    return () => {
      ignore = true
    }
  }, [])

  // 이전 미리보기 주소는 파일을 바꾸거나 화면을 떠날 때 해제한다.
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])
  useEffect(() => () => clearTimeout(redirectTimer.current), [])

  const tags = categories.list.find((c) => String(c.categoryId) === categoryId)?.tags ?? []

  const missing = [
    !file && '영상 파일',
    file && !durationSec && '영상 길이 확인 중',
    !title.trim() && '제목',
    !categoryId && '카테고리',
    !tagId && '개념 태그',
    !quizzes.every(isQuizFilled) && '퀴즈(문제·보기 4개·정답)',
  ].filter(Boolean)
  const canSubmit = missing.length === 0 && !submitting && !done

  function handleFileChange(event) {
    const selected = event.target.files?.[0]
    event.target.value = '' // 같은 파일을 다시 골라도 onChange가 오도록
    if (!selected) return

    if (!isMp4(selected)) {
      setFileError('MP4 영상 파일만 올릴 수 있어요.')
      return
    }
    if (selected.size > MAX_VIDEO_BYTES) {
      setFileError('영상은 100MB 이하만 올릴 수 있어요.')
      return
    }
    setFileError('')
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setDurationSec(0)
    setThumbnail(null)
    thumbnailTaken.current = false
  }

  function clearFile() {
    setFile(null)
    setPreviewUrl(null)
    setDurationSec(0)
    setThumbnail(null)
  }

  function handleLoadedMetadata(event) {
    const video = event.currentTarget
    setDurationSec(Math.ceil(video.duration))
    // 썸네일용으로 0.5초(짧은 영상은 절반) 지점으로 이동 → onSeeked에서 캡처
    video.currentTime = Math.min(0.5, video.duration / 2)
  }

  async function handleSeeked(event) {
    if (thumbnailTaken.current) return
    thumbnailTaken.current = true
    setThumbnail(await captureThumbnail(event.currentTarget))
  }

  function handlePreviewError() {
    setFileError('영상을 읽을 수 없어요. 다른 MP4 파일을 선택해 주세요.')
    clearFile()
  }

  function handleCategoryChange(value) {
    setCategoryId(value)
    setTagId('')
  }

  function updateQuiz(index, quiz) {
    setQuizzes((list) => list.map((q, i) => (i === index ? quiz : q)))
  }

  
  
  async function createClassification() {
    const name = creator.name.trim()

    if (
      !name ||
      creator.pending ||
      !['category', 'tag'].includes(creator.kind) ||
      (creator.kind === 'tag' && !categoryId)
    ) return

    setCreator(prev => ({
      ...prev,
      pending: true,
      error: '',
    }))

    try {
      if (creator.kind === 'category') {
        const category = await createVideoCategory(name)

        setCategories(prev => ({
          ...prev,
          list: [...prev.list, category],
        }))

        setCategoryId(String(category.categoryId))
        setTagId('')

      } else {
        const tag = await createVideoTag(categoryId, name)

        setCategories(prev => ({
          ...prev,
          list: prev.list.map(category =>
            String(category.categoryId) === String(categoryId)
              ? {
                  ...category,
                  tags: [...(category.tags || []), tag],
                }
              : category
          ),
        }))

        setTagId(String(tag.tagId))
      }

      setCreator({
        kind: '',
        name: '',
        pending: false,
        error: '',
      })

    } catch (error) {
      const kind = creator.kind === 'category'
        ? '카테고리'
        : '개념 태그'

      const status = error.response?.status

      setCreator(prev => ({
        ...prev,
        pending: false,
        error:
          status === 409
            ? `이미 등록된 ${kind}입니다.`
            : status === 401
              ? '로그인이 만료되었습니다.'
              : `${kind} 추가에 실패했습니다.`,
      }))
    }
  }



  
  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit || submitting) return

    setSubmitting(true)
    setProgress(0)
    setError('')

    const metadata = {
      title: title.trim(),
      description: description.trim() || null,
      categoryId: Number(categoryId),
      tagId: Number(tagId),
      durationSec,
    }

    try {
      // 기존 videos.js의 업로드 함수 사용
      await uploadVideo(file, metadata, thumbnail)

      setProgress(100)
      setDone(true)

      redirectTimer.current = setTimeout(() => {
        navigate(MY_CHANNEL_PATH)
      }, 1500)

    } catch (e) {
      setError(toUploadErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }


  if (loading) {
    return (
      <div className="vu-page">
        <p>회원 정보를 확인하고 있습니다.</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="vu-page">
        <h2>로그인이 필요합니다.</h2>
        <p>
          {sessionError || '로그인 후 영상을 업로드할 수 있습니다.'}
        </p>
        <Link to="/login">로그인하기</Link>
      </div>
    )
  }

  return (
    <div className="vu-page">
      <div className="vu-heading">
        <h1>영상 등록</h1>
        <p>짧은 학습 영상과 확인 퀴즈를 함께 올려 주세요.</p>
      </div>

      <form className="vu-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="vu-layout" disabled={submitting || done}>
          <section className="vu-panel vu-media">
            <h2>영상 파일 <em>*</em></h2>
            {previewUrl ? (
              <video
                key={previewUrl}
                className="vu-preview"
                src={previewUrl}
                controls
                playsInline
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata}
                onSeeked={handleSeeked}
                onError={handlePreviewError}
              />
            ) : (
              <label className="vu-dropzone" htmlFor="vu-file">
                <strong>영상 파일 선택</strong>
                <span>MP4 · 최대 100MB · 세로형(9:16) 권장</span>
              </label>
            )}
            <input
              id="vu-file"
              className="vu-file-input"
              type="file"
              accept={ACCEPT_VIDEO_TYPES}
              onChange={handleFileChange}
            />
            {file && (
              <div className="vu-file-info">
                <span className="vu-file-name">{file.name}</span>
                <span>
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                  {durationSec > 0 && ` · ${durationSec}초`}
                </span>
                <label htmlFor="vu-file" className="vu-text-button">
                  다른 파일 선택
                </label>
              </div>
            )}
            {fileError && <p className="vu-error" role="alert">{fileError}</p>}
          </section>

          <section className="vu-panel vu-details">
            <h2>영상 정보</h2>
            <label className="vu-field">
              <span>제목 <em>*</em></span>
              <input
                value={title}
                maxLength={100}
                placeholder="예) SQL JOIN 1분 정리"
                onChange={(e) => setTitle(e.target.value)}
              />
              <small className="vu-count">{title.length}/100</small>
            </label>

            <label className="vu-field">
              <span>설명</span>
              <textarea
                rows={4}
                value={description}
                maxLength={1000}
                placeholder="영상에서 다루는 내용을 간단히 적어 주세요 (선택)"
                onChange={(e) => setDescription(e.target.value)}
              />
              <small className="vu-count">{description.length}/1000</small>
            </label>

            
            <div className="vu-row">
              {/* 카테고리 */}
              <div className="vu-field">
                <label htmlFor="vu-category">
                  카테고리 <em>*</em>
                </label>

                <select
                  id="vu-category"
                  value={categoryId}
                  disabled={categories.status !== 'ready'}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">
                    {categories.status === 'loading'
                      ? '불러오는 중…'
                      : '선택하세요'}
                  </option>

                  {categories.list.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="vu-secondary"
                  disabled={creator.pending}
                  onClick={() => setCreator({
                    kind: 'category',
                    name: '',
                    pending: false,
                    error: '',
                  })}
                >
                  + 새 카테고리
                </button>
              </div>

              {/* 개념 태그 */}
              <div className="vu-field">
                <label htmlFor="vu-tag">
                  개념 태그 <em>*</em>
                </label>

                <select
                  id="vu-tag"
                  value={tagId}
                  disabled={!categoryId}
                  onChange={(e) => setTagId(e.target.value)}
                >
                  <option value="">
                    {categoryId
                      ? '선택하세요'
                      : '카테고리를 먼저 선택'}
                  </option>

                  {tags.map((t) => (
                    <option key={t.tagId} value={t.tagId}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="vu-secondary"
                  disabled={!categoryId || creator.pending}
                  onClick={() => setCreator({
                    kind: 'tag',
                    name: '',
                    pending: false,
                    error: '',
                  })}
                >
                  + 새 태그
                </button>
              </div>
            </div>

            {/* 새 카테고리 / 태그 입력창 */}
            {creator.kind && (
              <div className="vu-field">
                <label htmlFor="vu-classification">
                  새 {creator.kind === 'category'
                    ? '카테고리'
                    : '개념 태그'} 이름
                </label>

                <input
                  id="vu-classification"
                  value={creator.name}
                  maxLength={creator.kind === 'category' ? 30 : 50}
                  placeholder="이름을 입력하세요"
                  onChange={(e) => setCreator(prev => ({
                    ...prev,
                    name: e.target.value,
                    error: '',
                  }))}
                />

                <div className="vu-row">
                  <button
                    type="button"
                    className="vu-secondary"
                    disabled={!creator.name.trim() || creator.pending}
                    onClick={createClassification}
                  >
                    {creator.pending ? '추가 중…' : '추가'}
                  </button>

                  <button
                    type="button"
                    className="vu-secondary"
                    disabled={creator.pending}
                    onClick={() => setCreator({
                      kind: '',
                      name: '',
                      pending: false,
                      error: '',
                    })}
                  >
                    취소
                  </button>
                </div>

                {creator.error && (
                  <p className="vu-error" role="alert">
                    {creator.error}
                  </p>
                )}
              </div>
            )}

            {categories.status === 'error' && (
              <p className="vu-error" role="alert">카테고리를 불러오지 못했어요. {categories.message}</p>
            )}

            <h2 className="vu-section-title">확인 퀴즈</h2>
            <p className="vu-hint">영상을 다 본 학습자에게 나오는 4지선다 문제예요. 영상당 1~2문항.</p>
            {quizzes.map((quiz, i) => (
              <QuizFields
                key={i}
                index={i}
                quiz={quiz}
                onChange={(next) => updateQuiz(i, next)}
                onRemove={quizzes.length > 1 ? () => setQuizzes((list) => list.filter((_, j) => j !== i)) : null}
              />
            ))}
            {quizzes.length < MAX_QUIZZES && (
              <button type="button" className="vu-secondary" onClick={() => setQuizzes((list) => [...list, emptyQuiz()])}>
                + 퀴즈 추가
              </button>
            )}
          </section>
        </fieldset>

        <div className="vu-actions">
          {error && (
            <p className="vu-error" role="alert">
              {error}
              {error.includes('로그인') && <> <Link to="/login">로그인하기</Link></>}
            </p>
          )}
          {done && (
            <p className="vu-success" role="status">영상이 등록되었어요! 내 채널로 이동합니다…</p>
          )}
          {submitting && (
            <div className="vu-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="vu-progress__bar" style={{ width: `${progress}%` }} />
              <span>업로드 중… {progress}%</span>
            </div>
          )}
          {!submitting && !done && missing.length > 0 && (
            <p className="vu-hint">필수 항목을 입력해 주세요: {missing.join(', ')}</p>
          )}
          <div className="vu-buttons">
            <button type="button" className="vu-secondary" disabled={submitting} onClick={() => navigate(-1)}>
              취소
            </button>
            <button type="submit" className="vu-primary" disabled={!canSubmit}>
              {submitting ? '등록 중…' : '등록하기'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
