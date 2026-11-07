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

export async function updateNickname(nickname) {
  try {
    const { data } = await httpClient.patch('/api/users/me', {
      nickname,
    })

    return data
  } catch (error) {
    const status = error.response?.status

    if (status === 400) {
      throw new Error(
        error.response?.data?.message ||
        '닉네임은 1~30자로 입력해주세요.'
      )
    }

    if (status === 401) {
      throw new Error('로그인이 필요합니다.')
    }

    if (status === 409) {
      throw new Error('이미 사용 중인 닉네임입니다.')
    }

    throw new Error('닉네임을 변경하지 못했습니다.')
  }
}

export async function updatePassword(currentPassword, newPassword) {
  try {
    await httpClient.patch('/api/users/me/password', {
      currentPassword,
      newPassword,
    })
  } catch (error) {
    const status = error.response?.status

    if (status === 400) {
      throw new Error(
        error.response?.data?.message ||
        '현재 비밀번호 또는 새 비밀번호를 확인해주세요.'
      )
    }

    if (status === 401) {
      throw new Error('로그인이 필요합니다.')
    }

    throw new Error('비밀번호를 변경하지 못했습니다.')
  }
}

export async function deleteAccount(password) {
  try {
    await httpClient.delete('/api/users/me', {
      data: {
        password,
      },
    })
  } catch (error) {
    const status = error.response?.status

    if (status === 400) {
      throw new Error(
        error.response?.data?.message ||
        '비밀번호가 올바르지 않습니다.'
      )
    }

    if (status === 401) {
      throw new Error('로그인이 필요합니다.')
    }

    if (status === 403) {
      throw new Error('관리자 계정은 탈퇴할 수 없습니다.')
    }

    throw new Error('회원 탈퇴에 실패했습니다.')
  }
}