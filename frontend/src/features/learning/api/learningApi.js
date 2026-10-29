// 학습 화면이 쓰는 데이터는 전부 여기서만 불러온다.
// 지금은 가짜 데이터(mock)로 동작하고, VITE_USE_MOCK=false 로 두면 실제 백엔드 API를 부른다.
// 응답 모양은 백엔드 DTO(feature/learning 브랜치의 QuizResponse, AnswerResponse, RecommendResponse)에 맞춰 두었다.
//
// ⚠️ API를 붙일 때 axios는 반드시 httpClient.js 의 인스턴스(withCredentials: true)를 쓸 것.
//   세션 로그인이라 이 옵션이 없으면 세션 쿠키가 안 실려서 로그인이 풀린 것처럼 동작한다.

import httpClient from './httpClient'
import { mockQuizzes, mockVideos } from './mockData'
import { findNextVideoId } from './nextVideo'
import { loadSession } from '../store/learningSession'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

/** 채점·추천처럼 로그인이 필요한 API가 401을 줬는지 */
export const isLoginRequired = (error) => error?.response?.status === 401

// 서버는 '/api/videos/1/content' 같은 상대 주소를 준다. VITE_API_BASE_URL을 쓸 때도 맞는 주소가 되게 붙인다.
const toApiUrl = (url) => (url ? httpClient.getUri({ url }) : null)

/**
 * 영상 한 개. GET /api/videos/{videoId}
 * → { videoId, title, description, tagName, viewCount, likeCount, videoUrl, thumbnailUrl, ... }
 */
export async function getVideo(videoId) {
  if (USE_MOCK) {
    await delay()
    const video = mockVideos.find((v) => v.videoId === Number(videoId))
    if (!video) throw new Error(`영상을 찾을 수 없어요 (id: ${videoId})`)
    return video
  }
  const { data } = await httpClient.get(`/api/videos/${videoId}`)
  return { ...data, videoUrl: toApiUrl(data.videoUrl), thumbnailUrl: toApiUrl(data.thumbnailUrl) }
}

/**
 * 학습 순서상 다음 영상 id. currentId가 없으면 첫 영상. 마지막이면 null.
 * 실제 모드는 GET /api/videos(공개 영상 최신순, 12개씩) 목록 순서를 따른다.
 */
export async function getNextVideoId(currentId) {
  if (USE_MOCK) {
    const ids = mockVideos.map((v) => v.videoId)
    if (currentId == null) return ids[0]
    const index = ids.indexOf(Number(currentId))
    return index >= 0 && index < ids.length - 1 ? ids[index + 1] : null
  }
  return findNextVideoId(async (page) => {
    const { data } = await httpClient.get('/api/videos', { params: { page } })
    return data
  }, currentId)
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
 * 채점. 로그인 필요(세션). POST /api/quizzes/{quizId}/answer { selectedNo(1~4) }
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
 * 로그인 필요(세션). → [{ videoId, title, thumbnailUrl, likeCount, reason }]
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
        thumbnailUrl: v.thumbnailUrl,
        likeCount: v.likeCount,
        reason: sameTag(v) ? `'${v.tagName}' 한 번 더 복습` : `다음으로 배워볼 '${v.tagName}'`,
      }))
  }
  const { data } = await httpClient.get(`/api/videos/${videoId}/recommendations`, { params: { correct } })
  return data.map((item) => ({ ...item, thumbnailUrl: toApiUrl(item.thumbnailUrl) }))
}
