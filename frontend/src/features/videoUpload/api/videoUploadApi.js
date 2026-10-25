// 영상 등록 화면이 쓰는 API는 전부 여기서만 부른다.
// 지금은 가짜 데이터(mock)로 동작하고, VITE_USE_MOCK=false 로 두면 실제 백엔드 API를 부른다.
// 요청·응답 모양은 PR #7(feature/admin)의 VideoUploadController, VideoCategoryController 에 맞춰 두었다.
//   - GET  /api/video-categories → [{ categoryId, name, tags: [{ tagId, name }] }]
//   - POST /api/videos (multipart) file + request(JSON) + thumbnail(선택) → 201 { videoId, title, videoKey }
// 영상 파일은 서버 로컬 폴더(storage.location, 기본 uploads/)에 UUID 파일명으로 저장되고 video.video_key 에 그 파일명이 들어간다.

import axios from 'axios'
import { mockCategories } from './mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// ⚠️ withCredentials: true 는 꼭 유지할 것. 세션(JSESSIONID 쿠키) 로그인이라 이 옵션이 없으면
//   다른 origin으로 보내는 요청에 쿠키가 실리지 않아 401이 난다. (배포 시 백엔드 CORS allowCredentials(true)도 필요)
// Accept: application/json 이어야 로그인 안 된 요청이 로그인 페이지 리다이렉트 대신 401로 온다.
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

// 서버 제한과 같은 값 (spring.servlet.multipart.max-file-size=100MB, MP4만 허용)
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024
export const ACCEPT_VIDEO_TYPES = 'video/mp4'

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

/** 카테고리와 그 안의 개념 태그 목록 */
export async function getVideoCategories() {
  if (USE_MOCK) {
    await delay()
    return mockCategories
  }
  const { data } = await httpClient.get('/api/video-categories')
  return data
}

/**
 * 영상 등록. 파일 업로드와 영상 정보 저장을 한 번에 보낸다.
 * request: { title, description, categoryId, tagId, durationSec, quizzes: [{ question, option1~4, answerNo, explanation }] }
 * TODO 백엔드: PR #7의 VideoUploadRequest 에는 아직 quizzes 가 없어 서버가 무시한다.
 *   DB README대로 영상·퀴즈를 같은 트랜잭션에 저장하려면 VideoUploadRequest 에 quizzes 필드를 추가해야 한다.
 */
export async function uploadVideo({ file, thumbnail, request }, onProgress) {
  if (USE_MOCK) {
    for (let percent = 20; percent <= 100; percent += 20) {
      await delay(200)
      onProgress?.(percent)
    }
    return { videoId: Date.now() % 100000, title: request.title, videoKey: `mock-${file.name}` }
  }
  const form = new FormData()
  form.append('file', file)
  form.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }))
  if (thumbnail) form.append('thumbnail', thumbnail, 'thumbnail.jpg')
  const { data } = await httpClient.post('/api/videos', form, {
    onUploadProgress: (event) => event.total && onProgress?.(Math.round((event.loaded / event.total) * 100)),
  })
  return data
}

/** 서버 상태 코드를 화면에 보여줄 문장으로 바꾼다. (Spring 기본 에러 응답에는 message가 비어 있을 수 있다) */
export function toUploadErrorMessage(error) {
  const status = error?.response?.status
  if (!error?.response) return '서버에 연결하지 못했어요. 네트워크 상태를 확인해 주세요.'
  if (status === 401) return '로그인이 필요해요. 로그인 후 다시 시도해 주세요.'
  if (status === 404) return '선택한 카테고리 또는 개념 태그를 찾을 수 없어요.'
  if (status === 413) return '파일 용량이 너무 커요. 영상은 100MB 이하만 올릴 수 있어요.'
  if (status === 415) return 'MP4 영상 파일만 올릴 수 있어요.'
  if (status === 400) return error.response.data?.message || '입력한 내용을 다시 확인해 주세요.'
  return '영상을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.'
}
