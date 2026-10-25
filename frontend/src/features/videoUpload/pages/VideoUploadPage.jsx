import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ACCEPT_VIDEO_TYPES,
  MAX_VIDEO_BYTES,
  getVideoCategories,
  toUploadErrorMessage,
  uploadVideo,
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
  const [categories, setCategories] = useState({ status: 'loading', list: [] })

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

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    setProgress(0)
    setError('')
    try {
      await uploadVideo(
        {
          file,
          thumbnail,
          request: {
            title: title.trim(),
            description: description.trim() || null,
            categoryId: Number(categoryId),
            tagId: Number(tagId),
            durationSec,
            quizzes: quizzes.map(({ question, options, answerNo, explanation }) => ({
              question: question.trim(),
              option1: options[0].trim(),
              option2: options[1].trim(),
              option3: options[2].trim(),
              option4: options[3].trim(),
              answerNo,
              explanation: explanation.trim() || null,
            })),
          },
        },
        setProgress,
      )
      setDone(true)
      redirectTimer.current = setTimeout(() => navigate(MY_CHANNEL_PATH), 1500)
    } catch (e) {
      setError(toUploadErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
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
              <label className="vu-field">
                <span>카테고리 <em>*</em></span>
                <select
                  value={categoryId}
                  disabled={categories.status !== 'ready'}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">{categories.status === 'loading' ? '불러오는 중…' : '선택하세요'}</option>
                  {categories.list.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="vu-field">
                <span>개념 태그 <em>*</em></span>
                <select value={tagId} disabled={!categoryId} onChange={(e) => setTagId(e.target.value)}>
                  <option value="">{categoryId ? '선택하세요' : '카테고리를 먼저 선택'}</option>
                  {tags.map((t) => (
                    <option key={t.tagId} value={t.tagId}>{t.name}</option>
                  ))}
                </select>
              </label>
            </div>
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
