// 퀴즈 1문항 입력칸. quiz 테이블 컬럼(question, option1~4, answer_no, explanation) 기준.
export default function QuizFields({ index, quiz, onChange, onRemove }) {
  const name = `quiz-${index}`

  function updateOption(optionIndex, value) {
    onChange({ ...quiz, options: quiz.options.map((option, i) => (i === optionIndex ? value : option)) })
  }

  return (
    <fieldset className="vu-quiz">
      <legend>
        퀴즈 {index + 1}
        {onRemove && (
          <button type="button" className="vu-text-button" onClick={onRemove}>
            삭제
          </button>
        )}
      </legend>

      <label className="vu-field">
        <span>문제 <em>*</em></span>
        <input
          value={quiz.question}
          maxLength={500}
          placeholder="영상 내용을 확인하는 문제를 입력하세요"
          onChange={(e) => onChange({ ...quiz, question: e.target.value })}
        />
      </label>

      <div className="vu-options" role="radiogroup" aria-label={`퀴즈 ${index + 1} 보기와 정답`}>
        {quiz.options.map((option, i) => (
          <div className="vu-option" key={i}>
            <input
              type="radio"
              name={name}
              id={`${name}-answer-${i + 1}`}
              checked={quiz.answerNo === i + 1}
              onChange={() => onChange({ ...quiz, answerNo: i + 1 })}
            />
            <label htmlFor={`${name}-answer-${i + 1}`} className="vu-option__no">
              {i + 1}
            </label>
            <input
              value={option}
              maxLength={200}
              placeholder={`보기 ${i + 1}`}
              aria-label={`보기 ${i + 1}`}
              onChange={(e) => updateOption(i, e.target.value)}
            />
          </div>
        ))}
        <p className="vu-hint">정답인 보기의 번호를 선택하세요.</p>
      </div>

      <label className="vu-field">
        <span>해설</span>
        <textarea
          rows={2}
          value={quiz.explanation}
          maxLength={1000}
          placeholder="정답 확인 후 보여줄 해설 (선택)"
          onChange={(e) => onChange({ ...quiz, explanation: e.target.value })}
        />
      </label>
    </fieldset>
  )
}
