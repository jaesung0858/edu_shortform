import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isLoginRequired, isNotReady } from '../api/mypageApi'

// 세 목록이 같이 쓰는 틀: 쪽 불러오기, "더 보기", 로딩·에러·빈 목록 문구.
// fetchPage(page)는 { items, hasNext }를 돌려준다.
export default function PagedList({ title, fetchPage, emptyText, listClassName, renderItem }) {
  const [page, setPage] = useState(0)
  const [retry, setRetry] = useState(0)
  const [list, setList] = useState({ items: [], hasNext: false, loading: true, error: null })

  useEffect(() => {
    let ignore = false
    fetchPage(page)
      .then(({ items, hasNext }) => {
        if (ignore) return
        setList((prev) => ({ items: page === 0 ? items : [...prev.items, ...items], hasNext, loading: false, error: null }))
      })
      .catch((e) => {
        if (ignore) return
        const error = isNotReady(e) ? 'notReady' : isLoginRequired(e) ? 'login' : 'failed'
        setList((prev) => ({ ...prev, loading: false, error }))
      })
    return () => {
      ignore = true
    }
  }, [fetchPage, page, retry])

  function loadMore() {
    setList((prev) => ({ ...prev, loading: true, error: null }))
    setPage((p) => p + 1)
  }

  function reload() {
    setList((prev) => ({ ...prev, loading: true, error: null }))
    setRetry((n) => n + 1)
  }

  return (
    <section className="mpl-section">
      <h3 className="mpl-section__title">{title}</h3>

      {list.items.length > 0 && <ul className={listClassName}>{list.items.map(renderItem)}</ul>}

      {list.loading && (
        <p className="mpl-status" role="status">
          불러오는 중…
        </p>
      )}
      {list.error === 'notReady' && <p className="mpl-status">준비 중이에요.</p>}
      {list.error === 'login' && (
        <p className="mpl-status" role="alert">
          로그인이 필요해요. <Link to="/login">로그인하기</Link>
        </p>
      )}
      {list.error === 'failed' && (
        <div className="mpl-status" role="alert">
          <p>목록을 불러오지 못했어요.</p>
          <button type="button" className="btn-secondary" onClick={reload}>
            다시 시도
          </button>
        </div>
      )}
      {!list.loading && !list.error && list.items.length === 0 && <p className="mpl-status">{emptyText}</p>}

      {list.hasNext && !list.error && (
        <button type="button" className="btn-secondary mpl-more" disabled={list.loading} onClick={loadMore}>
          더 보기
        </button>
      )}
    </section>
  )
}
