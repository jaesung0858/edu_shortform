// 이번 학습(탭을 닫기 전까지)에서 본 영상과 푼 문제를 sessionStorage에 모아 둔다. 결과 요약 화면이 이걸 읽는다.

const KEY = 'edu-shortform:learning-session'

const emptySession = () => ({ watchedVideoIds: [], results: {} })

export function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) ?? emptySession()
  } catch {
    return emptySession()
  }
}

function saveSession(session) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    // 저장소를 못 쓰는 환경이면 요약만 비어 보인다.
  }
}

export function resetSession() {
  saveSession(emptySession())
}

export function markWatched(videoId) {
  const session = loadSession()
  if (!session.watchedVideoIds.includes(videoId)) session.watchedVideoIds.push(videoId)
  saveSession(session)
}

/** 같은 문제를 다시 풀면 마지막 결과로 덮어쓰고 시도 횟수만 늘린다. */
export function recordAnswer({ quizId, question, videoTitle, correct }) {
  const session = loadSession()
  const attempts = (session.results[quizId]?.attempts ?? 0) + 1
  session.results[quizId] = { quizId, question, videoTitle, correct, attempts }
  saveSession(session)
}

export function summarizeSession(session = loadSession()) {
  const results = Object.values(session.results)
  return {
    watchedCount: session.watchedVideoIds.length,
    solvedCount: results.length,
    correctCount: results.filter((r) => r.correct).length,
    results,
  }
}
