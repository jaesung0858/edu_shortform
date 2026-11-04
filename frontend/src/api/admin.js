import httpClient from './httpClient'

export async function getAdminUsers(keyword = '') {
  try {
    const { data } = await httpClient.get('/api/admin/users', {
      params: { keyword },
    })

    return data
  } catch (error) {
    const status = error.response?.status

    if (status === 401) {
      throw new Error('로그인이 필요합니다.')
    }

    if (status === 403) {
      throw new Error('관리자 권한이 필요합니다.')
    }

    throw new Error('회원 목록을 불러오지 못했습니다.')
  }
}