// 백엔드 테스트 데이터(docs/sql/03_test_learning_data.sql, feature/learning 브랜치)를 옮겨 온 가짜 데이터.
// 영상 파일은 공개 샘플 mp4로 대신한다.

const SAMPLE_VIDEOS = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
  'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
  'https://download.samplelib.com/mp4/sample-10s.mp4',
]

const sample = (i) => SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length]

export const mockVideos = [
  { videoId: 1, viewCount: 1200, tagName: 'SQL JOIN', title: 'SQL JOIN 기초', description: '두 테이블을 합치는 가장 기본 방법', likeCount: 120 },
  { videoId: 2, viewCount: 900, tagName: 'SQL JOIN', title: 'INNER JOIN vs LEFT JOIN 그림으로', description: '두 JOIN의 차이를 벤 다이어그램으로 정리해요', likeCount: 95 },
  { videoId: 3, viewCount: 500, tagName: 'SQL JOIN', title: 'JOIN 실습: 주문·고객 테이블', description: '주문이 없는 고객까지 조회해 보기', likeCount: 60 },
  { videoId: 4, viewCount: 1500, tagName: '인덱스', title: '인덱스는 왜 빠를까', description: '인덱스가 조회를 빠르게 만드는 원리와 단점', likeCount: 150 },
  { videoId: 5, viewCount: 700, tagName: '서브쿼리', title: '서브쿼리 입문', description: '쿼리 안에 쿼리를 넣는 법', likeCount: 80 },
  { videoId: 6, viewCount: 2500, tagName: 'VLOOKUP', title: 'VLOOKUP 1분 정리', description: '엑셀 실무 필수 함수 VLOOKUP', likeCount: 200 },
  { videoId: 7, viewCount: 1800, tagName: '피벗 테이블', title: '피벗 테이블로 월별 매출 요약', description: '클릭 몇 번으로 월별 합계 만들기', likeCount: 170 },
  { videoId: 8, viewCount: 300, tagName: 'VLOOKUP', title: 'VLOOKUP #N/A 오류 해결', description: '#N/A가 뜨는 가장 흔한 이유', likeCount: 40 },
].map((video, i) => ({ ...video, videoUrl: sample(i), thumbnailUrl: null }))

// answerNo·explanation은 서버에만 있는 값. 화면에는 채점 응답으로만 내려간다.
export const mockQuizzes = [
  { quizId: 1, videoId: 1, tagName: 'SQL JOIN', question: '두 테이블에서 조건이 일치하는 행만 가져오는 JOIN은?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'], answerNo: 1,
    explanation: 'INNER JOIN은 양쪽 테이블에 모두 일치하는 행만 결과에 남긴다.' },
  { quizId: 2, videoId: 1, tagName: 'SQL JOIN', question: 'JOIN에서 두 테이블을 연결하는 조건을 적는 키워드는?',
    options: ['WHERE', 'ON', 'HAVING', 'GROUP BY'], answerNo: 2,
    explanation: 'ON 뒤에 연결 조건을 적는다. WHERE는 연결한 뒤의 행을 거를 때 쓴다.' },
  { quizId: 3, videoId: 2, tagName: 'SQL JOIN', question: 'LEFT JOIN에서 오른쪽 테이블에 일치하는 행이 없으면?',
    options: ['그 행은 결과에서 빠진다', '오른쪽 컬럼이 NULL로 채워진다', '오류가 난다', '왼쪽 컬럼이 NULL로 채워진다'], answerNo: 2,
    explanation: 'LEFT JOIN은 왼쪽 행을 모두 남기고, 짝이 없으면 오른쪽 컬럼을 NULL로 채운다.' },
  { quizId: 4, videoId: 3, tagName: 'SQL JOIN', question: '주문이 없는 고객도 주문 0건으로 보이게 하려면?',
    options: ['orders INNER JOIN customers', 'customers INNER JOIN orders', 'customers LEFT JOIN orders', 'customers CROSS JOIN orders'], answerNo: 3,
    explanation: '고객을 왼쪽에 두고 LEFT JOIN해야 주문이 없는 고객도 남는다.' },
  { quizId: 5, videoId: 4, tagName: '인덱스', question: '인덱스가 조회를 빠르게 하는 이유는?',
    options: ['정렬된 구조로 찾을 위치를 바로 좁혀서', '데이터를 압축해서', '테이블 전체를 메모리에 복사해서', '중복 행을 지워서'], answerNo: 1,
    explanation: '인덱스는 정렬된 구조라 처음부터 끝까지 훑지 않고 위치를 좁혀 찾는다.' },
  { quizId: 6, videoId: 4, tagName: '인덱스', question: '인덱스를 많이 만들 때 생기는 단점은?',
    options: ['SELECT가 항상 느려진다', '데이터가 사라질 수 있다', '테이블을 하나만 만들 수 있다', 'INSERT·UPDATE가 느려질 수 있다'], answerNo: 4,
    explanation: '데이터를 바꿀 때마다 인덱스도 함께 고쳐야 해서 쓰기 작업이 느려진다.' },
  { quizId: 7, videoId: 5, tagName: '서브쿼리', question: '서브쿼리를 감쌀 때 쓰는 기호는?',
    options: ['중괄호 { }', '괄호 ( )', '대괄호 [ ]', "작은따옴표 ' '"], answerNo: 2,
    explanation: '서브쿼리는 괄호로 감싸서 바깥 쿼리 안에 넣는다.' },
  { quizId: 8, videoId: 6, tagName: 'VLOOKUP', question: 'VLOOKUP의 마지막 인수를 FALSE로 두면?',
    options: ['근사값을 찾는다', '대소문자를 구분한다', '정확히 일치하는 값만 찾는다', '오류가 난다'], answerNo: 3,
    explanation: 'FALSE(또는 0)는 정확히 일치하는 값만 찾는다.' },
  { quizId: 9, videoId: 7, tagName: '피벗 테이블', question: '피벗 테이블에서 월별 합계를 보려면 날짜 필드를 어디에 넣을까?',
    options: ['행 영역', '값 영역', '필터 영역', '피벗 테이블에는 넣을 수 없다'], answerNo: 1,
    explanation: '날짜를 행 영역에 넣고 월 단위로 그룹화하면 월별로 나뉜다. 합계를 낼 숫자는 값 영역에 넣는다.' },
  { quizId: 10, videoId: 8, tagName: 'VLOOKUP', question: 'VLOOKUP 결과가 #N/A일 때 가장 흔한 원인은?',
    options: ['셀 서식이 굵게 되어 있다', '시트 이름이 길다', '수식이 너무 짧다', '찾는 값이 범위의 첫 번째 열에 없다'], answerNo: 4,
    explanation: 'VLOOKUP은 범위의 첫 번째 열에서만 값을 찾는다.' },
]
