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

export async function getVideo(videoId) {
  const { data } = await httpClient.get(`/api/videos/${videoId}`)
  return {
    ...data,
    videoUrl: data.videoUrl ? httpClient.getUri({ url: data.videoUrl }) : null,
    thumbnailUrl: data.thumbnailUrl ? httpClient.getUri({ url: data.thumbnailUrl }) : null,
  }
}

export async function updateMyVideo(videoId, changes) {
  const { data } = await httpClient.patch(`/api/videos/${videoId}`, changes)
  return data
}

export async function deleteMyVideo(videoId) {
  await httpClient.delete(`/api/videos/${videoId}`)
}
