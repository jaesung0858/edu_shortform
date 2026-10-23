import httpClient from './httpClient'

export async function getVideos(page = 0, categoryId = '') {
  const { data } = await httpClient.get('/api/videos', {
    params: { page, ...(categoryId ? { categoryId } : {}) },
  })
  return data
}

export async function getMyVideos(page = 0) {
  const { data } = await httpClient.get('/api/users/me/videos', { params: { page } })
  return data
}

export async function getVideo(videoId) {
  const { data } = await httpClient.get(`/api/videos/${videoId}`)
  return { ...data, videoUrl: httpClient.getUri({ url: data.videoUrl }) }
}

export async function getVideoCategories() {
  const { data } = await httpClient.get('/api/video-categories')
  return data
}

export async function createVideoCategory(name) {
  const { data } = await httpClient.post('/api/video-categories', { name })
  return data
}

export async function createVideoTag(categoryId, name) {
  const { data } = await httpClient.post(`/api/video-categories/${categoryId}/tags`, { name })
  return data
}

export async function uploadVideo(file, metadata) {
  const form = new FormData()
  form.append('file', file)
  form.append('request', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  const { data } = await httpClient.post('/api/videos', form)
  return data
}
