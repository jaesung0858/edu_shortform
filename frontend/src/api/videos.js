import httpClient from './httpClient'

export async function getMyVideos(page = 0) {
  const { data } = await httpClient.get('/api/users/me/videos', { params: { page } })
  return {
    ...data,
    videos: (data.videos || []).map(video => ({
      ...video,
      thumbnailUrl: video.thumbnailUrl
        ? httpClient.getUri({ url: video.thumbnailUrl })
        : null,
    })),
  }
}
