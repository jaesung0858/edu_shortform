import { useState } from 'react'

export default function QuizCard({ quiz, index, total, submitting, onSubmit, onRewatch }) {
  const [selectedNo, setSelectedNo] = useState(null)

  return (
    <div className="lp-panel">
      <p className="lp-panel__step">
        퀴즈 {index + 1} / {total}
      </p>
      <h2 className="lp-panel__question">{quiz.question}</h2>

      <ol className="lp-options">
        {quiz.options.map((option, i) => {
          const no = i + 1
          return (
            <li key={no}>
              <button
                type="button"
                className={`lp-option${selectedNo === no ? ' is-selected' : ''}`}
                aria-pressed={selectedNo === no}
                onClick={() => setSelectedNo(no)}
                disabled={submitting}
              >
                <span className="lp-option__no">{no}</span>
                {option}
              </button>
            </li>
          )
        })}
      </ol>

      <div className="lp-actions">
        <button type="button" className="lp-btn" onClick={onRewatch} disabled={submitting}>
          영상 다시 보기
        </button>
        <button
          type="button"
          className="lp-btn lp-btn--primary"
          onClick={() => onSubmit(selectedNo)}
          disabled={selectedNo == null || submitting}
        >
          {submitting ? '채점 중…' : '제출하기'}
        </button>
      </div>
    </div>
  )
}
