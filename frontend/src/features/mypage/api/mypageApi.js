// 마이페이지 목록(좋아요·시청기록·오답노트)이 쓰는 데이터는 전부 여기서만 불러온다.
// 지금은 가짜 데이터(mock)로 동작하고, VITE_USE_MOCK=false 로 두면 실제 백엔드 API를 부른다.
// 응답 모양은 백엔드 DTO(VideoListResponse, WrongNoteListResponse)와 docs/api-spec.md에 맞춰 두었다.
//
// ⚠️ axios는 공통 httpClient(withCredentials: true)를 쓴다. 세션 로그인이라 쿠키가 실려야 한다.

import httpClient from '../../../api/httpClient'
import { mockLikedVideos, mockWatchHistory, mockWrongNotes } from './mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const PAGE_SIZE = 12

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

// 서버는 '/api/videos/1/thumbnail' 같은 상대 주소를 준다. VITE_API_BASE_URL 기준 주소로 바꾼다.
const toApiUrl = (url) => (url ? httpClient.getUri({ url }) : null)

/** 목록 API가 아직 없는 서버(404)인지 */
export const isNotReady = (error) => error?.response?.status === 404
/** 로그인이 풀렸는지(401) */
export const isLoginRequired = (error) => error?.response?.status === 401

// mock: 서버처럼 12개씩 잘라서 준다.
async function mockPage(items, page) {
  await delay()
  const start = page * PAGE_SIZE
  return { items: items.slice(start, start + PAGE_SIZE), hasNext: start + PAGE_SIZE < items.length }
}

async function getVideoPage(url, mockItems, page) {
  if (USE_MOCK) {
    const { items, hasNext } = await mockPage(mockItems, page)
    return { videos: items, categories: [], hasNext }
  }
  const { data } = await httpClient.get(url, { params: { page } })
  return { ...data, videos: data.videos.map((video) => ({ ...video, thumbnailUrl: toApiUrl(video.thumbnailUrl) })) }
}

/** 좋아요한 영상. GET /api/users/me/liked-videos?page= → { videos, categories, hasNext } */
export function getLikedVideos(page = 0) {
  return getVideoPage('/api/users/me/liked-videos', mockLikedVideos, page)
}

/** 시청기록(마지막으로 본 순). GET /api/users/me/watch-history?page= → { videos, categories, hasNext } */
export function getWatchHistory(page = 0) {
  return getVideoPage('/api/users/me/watch-history', mockWatchHistory, page)
}

/**
 * 오답노트(마지막으로 틀린 순). GET /api/users/me/wrong-notes?page=
 * → { notes: [{ quizId, question, options, answerNo, explanation, tagName, videoId, videoTitle, thumbnailUrl, wrongCount, lastWrongAt }], hasNext }
 */
export async function getWrongNotes(page = 0) {
  if (USE_MOCK) {
    const { items, hasNext } = await mockPage(mockWrongNotes, page)
    return { notes: items, hasNext }
  }
  const { data } = await httpClient.get('/api/users/me/wrong-notes', { params: { page } })
  return { ...data, notes: data.notes.map((note) => ({ ...note, thumbnailUrl: toApiUrl(note.thumbnailUrl) })) }
}
