// 백엔드 연결 전까지 쓰는 가짜 카테고리·개념 태그.
// docs/sql/03_test_learning_data.sql 의 category, concept_tag 데이터와 같은 번호를 쓴다.
// 모양은 GET /api/video-categories 응답(VideoCategoryResponse)과 같다.
export const mockCategories = [
  {
    categoryId: 1,
    name: '데이터베이스',
    tags: [
      { tagId: 1, name: 'SQL JOIN' },
      { tagId: 2, name: '인덱스' },
      { tagId: 3, name: '서브쿼리' },
    ],
  },
  {
    categoryId: 2,
    name: '엑셀',
    tags: [
      { tagId: 4, name: 'VLOOKUP' },
      { tagId: 5, name: '피벗 테이블' },
    ],
  },
]
