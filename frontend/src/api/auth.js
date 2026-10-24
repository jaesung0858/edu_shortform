import httpClient from './httpClient'

export async function signup({ email, password, nickname }) {
  const { data } = await httpClient.post('/api/users', { email, password, nickname })
  return data
}

export async function login(email, password) {
  await httpClient.post('/api/login', new URLSearchParams({ username: email, password }))
}

export async function getCurrentUser() {
  const { data } = await httpClient.get('/api/users/me')
  return data
}

export async function logout() {
  await httpClient.post('/api/logout')
}
