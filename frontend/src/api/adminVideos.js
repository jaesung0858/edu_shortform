import httpClient from './httpClient'

function withThumbnailUrls(data) {
  return {
    ...data,
    videos: data.videos.map(video => ({
      ...video,
      thumbnailUrl: video.thumbnailUrl
        ? httpClient.getUri({ url: video.thumbnailUrl })
        : null,
    })),
  }
}

export async function getAdminVideos(page = 0, keyword = '', { signal } = {}) {
  const { data } = await httpClient.get('/api/admin/videos', {
    params: { page, keyword },
    signal,
  })
  return withThumbnailUrls(data)
}

export async function getAdminVideo(videoId, { signal } = {}) {
  const { data } = await httpClient.get(`/api/admin/videos/${videoId}`, { signal })
  return {
    ...data,
    videoUrl: data.videoUrl ? httpClient.getUri({ url: data.videoUrl }) : null,
    thumbnailUrl: data.thumbnailUrl
      ? httpClient.getUri({ url: data.thumbnailUrl })
      : null,
  }
}

export async function updateAdminVideo(videoId, changes) {
  const { data } = await httpClient.patch(`/api/admin/videos/${videoId}`, changes)
  return {
    ...data,
    videoUrl: data.videoUrl ? httpClient.getUri({ url: data.videoUrl }) : null,
    thumbnailUrl: data.thumbnailUrl
      ? httpClient.getUri({ url: data.thumbnailUrl })
      : null,
  }
}

export async function deleteAdminVideo(videoId) {
  await httpClient.delete(`/api/admin/videos/${videoId}`)
}
