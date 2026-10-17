import axios from 'axios'

// 실제 백엔드 API를 부를 때 쓰는 axios 인스턴스.
// 공통 API 모듈이 생기면 그쪽으로 옮겨도 된다.
//
// ⚠️ withCredentials: true 는 꼭 유지할 것.
//   로그인이 세션(JSESSIONID 쿠키) 방식이라, 이 옵션이 없으면 다른 origin으로 보내는 요청에 쿠키가 실리지 않아
//   백엔드가 로그인 안 한 사용자로 본다. (개발 중에는 vite proxy 덕분에 같은 origin이라 티가 안 나지만,
//   배포에서 프론트·백엔드 도메인이 다르면 바로 문제가 된다. 그때 백엔드 CORS에도 allowCredentials(true)가 필요하다.)
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
})

// TODO 임시: 백엔드가 users 테이블 로그인 연동 전까지 학습 API를 X-User-Id 헤더로 받는다.
//   세션 로그인이 붙으면 이 헤더는 지울 것. (2 = docs/sql/02_test_users.sql 의 learner 계정이라고 가정)
httpClient.defaults.headers.common['X-User-Id'] = import.meta.env.VITE_TEST_USER_ID || '2'

export default httpClient
