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

// 특정 회원 상세 조회
export async function getAdminUser(userId) {
  try {
    const { data } = await httpClient.get(`/api/admin/users/${userId}`)
    return data
  } catch (error) {
    const status = error.response?.status

    if (status === 400) {
      throw new Error('잘못된 회원 번호입니다.')
    }
    if (status === 401) {
      throw new Error('로그인이 필요합니다.')
    }
    if (status === 403) {
      throw new Error('관리자 권한이 필요합니다.')
    }
    if (status === 404) {
      throw new Error('회원을 찾을 수 없습니다.')
    }

    throw new Error('회원 정보를 불러오지 못했습니다.')
  }
}

// 회원 닉네임 수정
export async function updateAdminUserNickname(userId, nickname) {
  try {
    const { data } = await httpClient.patch(`/api/admin/users/${userId}`, {
      nickname,
    })

    return data
  } catch (error) {
    const status = error.response?.status

    if (status === 400) {
      throw new Error('닉네임을 확인해주세요.')
    }
    if (status === 401) {
      throw new Error('로그인이 필요합니다.')
    }
    if (status === 403) {
      throw new Error('관리자 권한이 필요합니다.')
    }
    if (status === 404) {
      throw new Error('회원을 찾을 수 없습니다.')
    }
    if (status === 409) {
      throw new Error('이미 사용 중인 닉네임입니다.')
    }

    throw new Error('회원 정보를 수정하지 못했습니다.')
  }
}

// 회원 삭제
export async function deleteAdminUser(userId) {
  try {
    await httpClient.delete(`/api/admin/users/${userId}`)
  } catch (error) {
    const status = error.response?.status

    if (status === 400) {
      throw new Error('잘못된 회원 번호입니다.')
    }
    if (status === 401) {
      throw new Error('로그인이 필요합니다.')
    }
    if (status === 403) {
      throw new Error('관리자 계정은 삭제할 수 없습니다.')
    }
    if (status === 404) {
      throw new Error('회원을 찾을 수 없습니다.')
    }

    throw new Error('회원을 삭제하지 못했습니다.')
  }
}