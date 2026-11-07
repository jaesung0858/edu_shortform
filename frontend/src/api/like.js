import httpClient from './httpClient'

function handleLikeError(error) {
  const status = error.response?.status
  // 화면에서 401(로그인 필요)을 구분할 수 있게 상태 코드를 붙여 던진다
  const fail = (message) => Object.assign(new Error(message), { status })

  if (status === 400) {
    throw fail('잘못된 영상 요청입니다.')
  }

  if (status === 401) {
    throw fail('로그인이 필요합니다.')
  }

  if (status === 404) {
    throw fail('영상을 찾을 수 없습니다.')
  }

  throw fail('좋아요 처리 중 오류가 발생했습니다.')
}

export async function getLikeStatus(videoId) {
  try {
    const { data } = await httpClient.get(`/api/videos/${videoId}/like`)
    return data
  } catch (error) {
    handleLikeError(error)
  }
}

export async function likeVideo(videoId) {
  try {
    const { data } = await httpClient.put(`/api/videos/${videoId}/like`)
    return data
  } catch (error) {
    handleLikeError(error)
  }
}

export async function unlikeVideo(videoId) {
  try {
    const { data } = await httpClient.delete(`/api/videos/${videoId}/like`)
    return data
  } catch (error) {
    handleLikeError(error)
  }
}