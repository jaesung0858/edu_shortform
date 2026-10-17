import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNextVideoId } from '../api/learningApi'
import { resetSession, summarizeSession } from '../store/learningSession'
import '../learning.css'

export default function SummaryPage() {
  const navigate = useNavigate()
  const [summary] = useState(() => summarizeSession())
  const { watchedCount, solvedCount, correctCount, results } = summary
  const rate = solvedCount > 0 ? Math.round((correctCount / solvedCount) * 100) : 0

  async function startOver() {
    resetSession()
    navigate(`/learn/${await getNextVideoId(null)}`)
  }

  return (
    <div className="lp-page">
      <header className="lp-header">
        <span className="lp-header__title">학습 결과</span>
      </header>

      <main className="lp-stage">
        <div className="lp-panel">
          <div className="lp-stats">
            <div className="lp-stat">
              <span className="lp-stat__value">{watchedCount}</span>
              <span className="lp-stat__label">본 영상</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat__value">{solvedCount}</span>
              <span className="lp-stat__label">푼 문제</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat__value">{correctCount}</span>
              <span className="lp-stat__label">맞힌 문제</span>
            </div>
          </div>

          {solvedCount > 0 ? (
            <>
              <p className="lp-rate">정답률 {rate}%</p>
              <ul className="lp-history">
                {results.map((r) => (
                  <li key={r.quizId} className="lp-history__item">
                    <span className={r.correct ? 'is-correct' : 'is-wrong'}>{r.correct ? '⭕' : '❌'}</span>
                    <div>
                      <p className="lp-history__q">{r.question}</p>
                      <p className="lp-muted">
                        {r.videoTitle}
                        {r.attempts > 1 && ` · ${r.attempts}번 시도`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="lp-muted lp-center">아직 푼 문제가 없어요.</p>
          )}

          <div className="lp-actions">
            <button type="button" className="lp-btn" onClick={() => navigate(-1)}>
              이어서 학습
            </button>
            <button type="button" className="lp-btn lp-btn--primary" onClick={startOver}>
              처음부터 다시
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
