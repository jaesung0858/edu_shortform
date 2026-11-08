// 마이페이지 목록용 가짜 데이터. 실제 API 응답(VideoListResponse.Item, WrongNoteListResponse.Item)과 같은 모양이다.
// 영상 id·제목은 학습 화면 mock(features/learning/api/mockData.js)과 맞춰서 카드를 누르면 학습 화면이 열린다.

const VIDEOS = [
  [1, 'SQL JOIN 기초', 'DB', 'SQL JOIN', 1200, 120],
  [2, 'INNER JOIN vs LEFT JOIN 그림으로', 'DB', 'SQL JOIN', 900, 95],
  [3, 'JOIN 실습: 주문·고객 테이블', 'DB', 'SQL JOIN', 500, 60],
  [4, '인덱스는 왜 빠를까', 'DB', '인덱스', 1500, 150],
  [5, '서브쿼리 입문', 'DB', '서브쿼리', 700, 80],
  [6, 'VLOOKUP 1분 정리', '엑셀', 'VLOOKUP', 2500, 200],
  [7, '피벗 테이블로 월별 매출 요약', '엑셀', '피벗 테이블', 1800, 170],
  [8, 'VLOOKUP #N/A 오류 해결', '엑셀', 'VLOOKUP', 300, 40],
].map(([videoId, title, categoryName, tagName, viewCount, likeCount]) => ({
  videoId,
  title,
  creatorNickname: '에듀쇼츠',
  categoryId: categoryName === 'DB' ? 1 : 2,
  categoryName,
  tagName,
  viewCount,
  likeCount,
  durationSec: 60,
  createdAt: '2026-10-20T10:00:00',
  status: 'PUBLIC',
  thumbnailUrl: null,
}))

// 좋아요 목록은 "더 보기"를 확인할 수 있게 12개가 넘도록 반복한다(id는 학습 mock 범위 1~8 안에서 돈다).
export const mockLikedVideos = Array.from({ length: 15 }, (_, i) => ({
  ...VIDEOS[i % VIDEOS.length],
  title: i < VIDEOS.length ? VIDEOS[i].title : `${VIDEOS[i % VIDEOS.length].title} (${Math.floor(i / VIDEOS.length) + 1})`,
}))

export const mockWatchHistory = [VIDEOS[4], VIDEOS[0], VIDEOS[5], VIDEOS[1]]

export const mockWrongNotes = [
  {
    quizId: 3,
    question: 'LEFT JOIN에서 오른쪽 테이블에 맞는 행이 없으면?',
    options: ['그 행은 결과에서 빠진다', '오른쪽 컬럼이 NULL로 채워진다', '오류가 난다', '왼쪽 컬럼이 NULL로 채워진다'],
    answerNo: 2,
    explanation: 'LEFT JOIN은 왼쪽 테이블의 행을 모두 남기고, 짝이 없는 오른쪽 컬럼은 NULL로 채운다.',
    tagName: 'SQL JOIN',
    videoId: 2,
    videoTitle: 'INNER JOIN vs LEFT JOIN 그림으로',
    thumbnailUrl: null,
    wrongCount: 3,
    lastWrongAt: '2026-11-07T21:10:00',
  },
  {
    quizId: 1,
    question: '두 테이블에서 조건이 일치하는 행만 가져오는 JOIN은?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
    answerNo: 1,
    explanation: 'INNER JOIN은 양쪽 테이블에 모두 일치하는 행만 결과에 남긴다.',
    tagName: 'SQL JOIN',
    videoId: 1,
    videoTitle: 'SQL JOIN 기초',
    thumbnailUrl: null,
    wrongCount: 1,
    lastWrongAt: '2026-11-06T09:30:00',
  },
]
