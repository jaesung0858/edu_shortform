import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getNextVideoId, getQuizzes, getVideo, isLoginRequired, submitAnswer } from '../api/learningApi'
import { markWatched, recordAnswer } from '../store/learningSession'
import LoginRequired from '../components/LoginRequired'
import QuizCard from '../components/QuizCard'
import QuizResult from '../components/QuizResult'
import RecommendList from '../components/RecommendList'
import VideoPlayer from '../components/VideoPlayer'
import '../learning.css'

// error 상태에 이 값이 들어오면 문구 대신 로그인 안내를 보여준다.
const LOGIN_REQUIRED = 'login'

// /learn/:videoId — 영상이 바뀌면 key로 화면 상태를 통째로 초기화한다.
export function LearningRoute() {
  const { videoId } = useParams()
  return <LearningPage key={videoId} videoId={Number(videoId)} />
}

// 흐름: watching(영상) → quiz(문제) → result(정답·해설·추천) → 다음 문제 / 다음 영상
export default function LearningPage({ videoId }) {
  const navigate = useNavigate()
  const [load, setLoad] = useState({ status: 'loading', video: null, quizzes: [] })
  const [phase, setPhase] = useState('watching')
  const [quizIndex, setQuizIndex] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    Promise.all([getVideo(videoId), getQuizzes(videoId)])
      .then(([video, quizzes]) => !ignore && setLoad({ status: 'ready', video, quizzes }))
      .catch((e) => !ignore && setLoad({ status: 'error', video: null, quizzes: [], message: e.message }))
    return () => {
      ignore = true
    }
  }, [videoId])

  const { video, quizzes } = load
  const quiz = quizzes[quizIndex]
  const isLastQuiz = quizIndex >= quizzes.length - 1

  function handleVideoEnded() {
    markWatched(videoId)
    setPhase(quizzes.length > 0 ? 'quiz' : 'noQuiz')
  }

  async function handleSubmit(selectedNo) {
    setSubmitting(true)
    setError(null)
    try {
      const response = await submitAnswer(quiz.quizId, selectedNo)
      recordAnswer({ quizId: quiz.quizId, question: quiz.question, videoTitle: video.title, correct: response.correct })
      setResult({ ...response, selectedNo })
      setPhase('result')
    } catch (e) {
      setError(isLoginRequired(e) ? LOGIN_REQUIRED : '채점에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleRetry() {
    setResult(null)
    setAttempt((n) => n + 1)
    setPhase('quiz')
  }

  async function goNext() {
    setError(null)
    if (!isLastQuiz) {
      setQuizIndex((i) => i + 1)
      setResult(null)
      setPhase('quiz')
      return
    }
    try {
      const nextId = await getNextVideoId(videoId)
      navigate(nextId ? `/learn/${nextId}` : '/learn/summary')
    } catch {
      setError('다음 영상을 불러오지 못했어요. 다시 시도해 주세요.')
    }
  }

  return (
    <div className="lp-page">
      <header className="lp-header">
        <Link className="lp-btn lp-btn--ghost" to="/home">
          홈
        </Link>
        <span className="lp-header__title">오늘의 학습</span>
        <Link className="lp-btn lp-btn--ghost" to="/learn/summary">
          학습 종료
        </Link>
      </header>

      <main className="lp-stage">
        {load.status === 'loading' && <p className="lp-muted lp-center">불러오는 중…</p>}
        {load.status === 'error' && (
          <div className="lp-panel lp-center">
            <p>{load.message ?? '영상을 불러오지 못했어요.'}</p>
            <Link className="lp-btn btn-primary" to="/learn/1">
              처음 영상으로
            </Link>
          </div>
        )}

        {load.status === 'ready' && (
          <>
            {phase === 'watching' && <VideoPlayer video={video} onEnded={handleVideoEnded} />}

            {phase === 'quiz' && (
              <>
                <QuizCard
                  key={`${quiz.quizId}-${attempt}`}
                  quiz={quiz}
                  index={quizIndex}
                  total={quizzes.length}
                  submitting={submitting}
                  onSubmit={handleSubmit}
                  onRewatch={() => setPhase('watching')}
                />
              </>
            )}

            {phase === 'result' && (
              <>
                <QuizResult
                  quiz={quiz}
                  result={result}
                  isLastQuiz={isLastQuiz}
                  onNext={goNext}
                  onRetry={handleRetry}
                  onSkip={goNext}
                />
                <RecommendList videoId={videoId} correct={result.correct} />
              </>
            )}

            {phase === 'noQuiz' && (
              <>
                <div className="lp-panel">
                  <h2 className="lp-panel__question">이 영상에는 퀴즈가 없어요</h2>
                  <div className="lp-actions">
                    <button type="button" className="lp-btn btn-primary" onClick={goNext}>
                      다음 영상
                    </button>
                  </div>
                </div>
                <RecommendList videoId={videoId} correct />
              </>
            )}

            {error === LOGIN_REQUIRED ? (
              <LoginRequired message="로그인이 필요해요. 로그인하면 채점 결과와 오답 노트가 저장돼요." />
            ) : (
              error && <p className="lp-error">{error}</p>
            )}
          </>
        )}
      </main>
    </div>
  )
}
