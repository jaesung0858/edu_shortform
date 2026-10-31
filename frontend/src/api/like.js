import httpClient from './httpClient'

function handleLikeError(error) {
  const status = error.response?.status

  if (status === 400) {
    throw new Error('잘못된 영상 요청입니다.')
  }

  if (status === 401) {
    throw new Error('로그인이 필요합니다.')
  }

  if (status === 404) {
    throw new Error('영상을 찾을 수 없습니다.')
  }

  throw new Error('좋아요 처리 중 오류가 발생했습니다.')
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