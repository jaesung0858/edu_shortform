// 학습 화면이 쓰는 데이터는 전부 여기서만 불러온다.
// 지금은 가짜 데이터(mock)로 동작하고, VITE_USE_MOCK=false 로 두면 실제 백엔드 API를 부른다.
// 응답 모양은 백엔드 DTO(feature/learning 브랜치의 QuizResponse, AnswerResponse, RecommendResponse)에 맞춰 두었다.
//
// ⚠️ API를 붙일 때 axios는 반드시 httpClient.js 의 인스턴스(withCredentials: true)를 쓸 것.
//   세션 로그인이라 이 옵션이 없으면 세션 쿠키가 안 실려서 로그인이 풀린 것처럼 동작한다.

import httpClient from './httpClient'
import { mockQuizzes, mockVideos } from './mockData'
import { loadSession } from '../store/learningSession'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 영상 한 개. → { videoId, title, description, videoUrl, tagName, likeCount, thumbnailUrl }
 * TODO 백엔드에 영상 상세 API가 아직 없다. 생기면 경로와 videoKey → URL 변환 방식을 맞출 것.
 */
export async function getVideo(videoId) {
  if (USE_MOCK) {
    await delay()
    const video = mockVideos.find((v) => v.videoId === Number(videoId))
    if (!video) throw new Error(`영상을 찾을 수 없어요 (id: ${videoId})`)
    return video
  }
  const { data } = await httpClient.get(`/api/videos/${videoId}`)
  return data
}

/**
 * 학습 순서상 다음 영상 id. currentId가 없으면 첫 영상. 마지막이면 null.
 * TODO 백엔드에 "다음 영상" API가 아직 없다. 지금은 mock 순서를 그대로 쓴다.
 */
export async function getNextVideoId(currentId) {
  const ids = mockVideos.map((v) => v.videoId)
  if (currentId == null) return ids[0]
  const index = ids.indexOf(Number(currentId))
  return index >= 0 && index < ids.length - 1 ? ids[index + 1] : null
}

/** 영상이 끝나면 부르는 퀴즈 목록. GET /api/videos/{videoId}/quizzes → [{ quizId, question, options }] */
export async function getQuizzes(videoId) {
  if (USE_MOCK) {
    await delay()
    return mockQuizzes
      .filter((q) => q.videoId === Number(videoId))
      .map(({ quizId, question, options }) => ({ quizId, question, options }))
  }
  const { data } = await httpClient.get(`/api/videos/${videoId}/quizzes`)
  return data
}

/**
 * 채점. POST /api/quizzes/{quizId}/answer { selectedNo(1~4) }
 * → { correct, answerNo, explanation, tagName, addedToWrongNote }
 */
export async function submitAnswer(quizId, selectedNo) {
  if (USE_MOCK) {
    await delay()
    const quiz = mockQuizzes.find((q) => q.quizId === quizId)
    if (!quiz) throw new Error(`퀴즈를 찾을 수 없어요 (id: ${quizId})`)
    const correct = quiz.answerNo === selectedNo
    return {
      correct,
      answerNo: quiz.answerNo,
      explanation: quiz.explanation,
      tagName: quiz.tagName,
      addedToWrongNote: !correct,
    }
  }
  const { data } = await httpClient.post(`/api/quizzes/${quizId}/answer`, { selectedNo })
  return data
}

/**
 * 결과 화면의 추천 영상. GET /api/videos/{videoId}/recommendations?correct=
 * → [{ videoId, title, thumbnailKey, likeCount, reason }]
 */
export async function getRecommendations(videoId, correct = true) {
  if (USE_MOCK) {
    await delay()
    const current = mockVideos.find((v) => v.videoId === Number(videoId))
    // 서버는 시청 기록으로 본 영상을 뺀다. mock에서는 이번 학습에서 본 영상으로 흉내 낸다.
    const watched = new Set(loadSession().watchedVideoIds)
    const candidates = mockVideos.filter((v) => v.videoId !== Number(videoId) && !watched.has(v.videoId))
    // 틀렸으면 같은 개념 복습 영상을, 맞혔으면 다른 개념 영상을 먼저 보여준다.
    const sameTag = (v) => v.tagName === current?.tagName
    return candidates
      .sort((a, b) => Number(sameTag(b) === !correct) - Number(sameTag(a) === !correct) || b.likeCount - a.likeCount)
      .slice(0, 3)
      .map((v) => ({
        videoId: v.videoId,
        title: v.title,
        thumbnailKey: v.thumbnailUrl,
        likeCount: v.likeCount,
        reason: sameTag(v) ? `'${v.tagName}' 한 번 더 복습` : `다음으로 배워볼 '${v.tagName}'`,
      }))
  }
  const { data } = await httpClient.get(`/api/videos/${videoId}/recommendations`, { params: { correct } })
  return data
}
