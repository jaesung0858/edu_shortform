import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Thumbnail } from './MyVideoCard'

// 오답노트 카드. 누르면 보기·정답·해설이 펼쳐진다. "다시 보기"는 그 영상의 학습 화면으로 간다.
export default function WrongNoteCard({ note }) {
  const [open, setOpen] = useState(false)
  const detailId = `mpl-note-${note.quizId}`

  return (
    <div className={`mpl-note${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="mpl-note__summary"
        aria-expanded={open}
        aria-controls={detailId}
        onClick={() => setOpen((v) => !v)}
      >
        <Thumbnail className="mpl-note__thumb" src={note.thumbnailUrl} />
        <span className="mpl-note__body">
          <span className="mpl-muted">{note.videoTitle}</span>
          <span className="mpl-note__question">{note.question}</span>
          <span className="mpl-note__count">{note.wrongCount}번 틀림</span>
        </span>
        <span className="mpl-note__chevron" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="mpl-note__detail" id={detailId}>
          <ol className="mpl-note__options">
            {note.options.map((option, i) => (
              <li key={i} className={i + 1 === note.answerNo ? 'is-answer' : undefined}>
                <span className="mpl-note__no">{i + 1}</span>
                {option}
                {i + 1 === note.answerNo && <span className="mpl-note__badge">정답</span>}
              </li>
            ))}
          </ol>
          <div className="mpl-note__explain">
            <strong>해설</strong>
            <p>{note.explanation}</p>
          </div>
          <Link className="btn-primary mpl-note__rewatch" to={`/learn/${note.videoId}`}>
            다시 보기
          </Link>
        </div>
      )}
    </div>
  )
}
