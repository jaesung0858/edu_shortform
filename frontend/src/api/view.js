import httpClient from './httpClient'

function handleViewError(error) {
  const status = error.response?.status

  if (status === 400) {
    throw new Error('잘못된 영상 요청입니다.')
  }

  if (status === 404) {
    throw new Error('영상을 찾을 수 없습니다.')
  }

  throw new Error('조회수 처리 중 오류가 발생했습니다.')
}

export async function increaseView(videoId) {
  try {
    const { data } = await httpClient.post(
      `/api/videos/${videoId}/views`
    )

    return data
  } catch (error) {
    handleViewError(error)
  }
}