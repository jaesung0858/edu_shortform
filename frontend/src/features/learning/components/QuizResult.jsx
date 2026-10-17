export default function QuizResult({ quiz, result, isLastQuiz, onNext, onRetry, onSkip }) {
  const nextLabel = isLastQuiz ? '다음 영상' : '다음 문제'

  return (
    <div className="lp-panel">
      <p className={`lp-verdict ${result.correct ? 'is-correct' : 'is-wrong'}`}>
        {result.correct ? '⭕ 정답이에요!' : '❌ 아쉬워요, 오답이에요'}
      </p>
      <h2 className="lp-panel__question">{quiz.question}</h2>

      <ol className="lp-options">
        {quiz.options.map((option, i) => {
          const no = i + 1
          const state = no === result.answerNo ? ' is-answer' : no === result.selectedNo ? ' is-wrong' : ''
          return (
            <li key={no}>
              <div className={`lp-option lp-option--static${state}`}>
                <span className="lp-option__no">{no}</span>
                {option}
              </div>
            </li>
          )
        })}
      </ol>

      <div className="lp-explain">
        <strong>해설</strong>
        <p>{result.explanation}</p>
        {result.addedToWrongNote && <p className="lp-explain__note">오답 노트에 저장했어요.</p>}
      </div>

      <div className="lp-actions">
        {result.correct ? (
          <button type="button" className="lp-btn lp-btn--primary" onClick={onNext}>
            {nextLabel}
          </button>
        ) : (
          <>
            <button type="button" className="lp-btn" onClick={onSkip}>
              넘어가기
            </button>
            <button type="button" className="lp-btn lp-btn--primary" onClick={onRetry}>
              다시 풀기
            </button>
          </>
        )}
      </div>
    </div>
  )
}
