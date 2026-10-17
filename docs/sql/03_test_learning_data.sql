-- 로컬 개발용 학습 기능 테스트 데이터 (카테고리·개념 태그·영상·퀴즈·시청 기록)
-- 01_schema.sql, 02_test_users.sql 실행 후 새 DB에 한 번만 실행한다.
-- 영상 작성자와 시청 기록의 회원은 02_test_users.sql의 이메일로 찾는다.
-- video.like_count는 추천 정렬 확인용 임시 숫자이며 video_like 기록과 맞추지 않았다.

USE edu_shortform;

INSERT INTO category (category_id, name) VALUES
(1, '데이터베이스'),
(2, '엑셀');

INSERT INTO concept_tag (tag_id, category_id, name) VALUES
(1, 1, 'SQL JOIN'),
(2, 1, '인덱스'),
(3, 1, '서브쿼리'),
(4, 2, 'VLOOKUP'),
(5, 2, '피벗 테이블');

SET @creator = (SELECT user_id FROM users WHERE email = 'creator@example.com');
SET @learner = (SELECT user_id FROM users WHERE email = 'learner@example.com');

INSERT INTO video (video_id, creator_id, category_id, tag_id, title, description, video_key, thumbnail_key,
                   duration_sec, view_count, like_count, status) VALUES
(1, @creator, 1, 1, 'SQL JOIN 기초',                  '두 테이블을 합치는 가장 기본 방법', 'videos/1.mp4', 'thumbnails/1.jpg', 58, 1200, 120, 'PUBLIC'),
(2, @creator, 1, 1, 'INNER JOIN vs LEFT JOIN 그림으로', NULL, 'videos/2.mp4', 'thumbnails/2.jpg', 52,  900,  95, 'PUBLIC'),
(3, @creator, 1, 1, 'JOIN 실습: 주문·고객 테이블',      NULL, 'videos/3.mp4', 'thumbnails/3.jpg', 60,  500,  60, 'PUBLIC'),
(4, @creator, 1, 2, '인덱스는 왜 빠를까',              NULL, 'videos/4.mp4', 'thumbnails/4.jpg', 55, 1500, 150, 'PUBLIC'),
(5, @creator, 1, 3, '서브쿼리 입문',                   NULL, 'videos/5.mp4', 'thumbnails/5.jpg', 59,  700,  80, 'PUBLIC'),
(6, @creator, 2, 4, 'VLOOKUP 1분 정리',                NULL, 'videos/6.mp4', 'thumbnails/6.jpg', 60, 2500, 200, 'PUBLIC'),
(7, @creator, 2, 5, '피벗 테이블로 월별 매출 요약',     NULL, 'videos/7.mp4', 'thumbnails/7.jpg', 57, 1800, 170, 'PUBLIC'),
(8, @creator, 2, 4, 'VLOOKUP #N/A 오류 해결',          NULL, 'videos/8.mp4', 'thumbnails/8.jpg', 45,  300,  40, 'PUBLIC'),
(9, @creator, 1, 1, '숨긴 영상 (추천에 나오면 안 됨)',  NULL, 'videos/9.mp4', NULL,              30,    0, 999, 'HIDDEN');

INSERT INTO quiz (quiz_id, video_id, tag_id, question, option1, option2, option3, option4, answer_no, explanation) VALUES
(1, 1, 1, '두 테이블에서 조건이 일치하는 행만 가져오는 JOIN은?',
    'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN', 1,
    'INNER JOIN은 양쪽 테이블에 모두 일치하는 행만 결과에 남긴다.'),
(2, 1, 1, 'JOIN에서 두 테이블을 연결하는 조건을 적는 키워드는?',
    'WHERE', 'ON', 'HAVING', 'GROUP BY', 2,
    'ON 뒤에 연결 조건을 적는다. WHERE는 연결한 뒤의 행을 거를 때 쓴다.'),
(3, 2, 1, 'LEFT JOIN에서 오른쪽 테이블에 일치하는 행이 없으면?',
    '그 행은 결과에서 빠진다', '오른쪽 컬럼이 NULL로 채워진다', '오류가 난다', '왼쪽 컬럼이 NULL로 채워진다', 2,
    'LEFT JOIN은 왼쪽 행을 모두 남기고, 짝이 없으면 오른쪽 컬럼을 NULL로 채운다.'),
(4, 3, 1, '주문이 없는 고객도 주문 0건으로 보이게 하려면?',
    'orders INNER JOIN customers', 'customers INNER JOIN orders', 'customers LEFT JOIN orders', 'customers CROSS JOIN orders', 3,
    '고객을 왼쪽에 두고 LEFT JOIN해야 주문이 없는 고객도 남는다.'),
(5, 4, 2, '인덱스가 조회를 빠르게 하는 이유는?',
    '정렬된 구조로 찾을 위치를 바로 좁혀서', '데이터를 압축해서', '테이블 전체를 메모리에 복사해서', '중복 행을 지워서', 1,
    '인덱스는 정렬된 구조라 처음부터 끝까지 훑지 않고 위치를 좁혀 찾는다.'),
(6, 4, 2, '인덱스를 많이 만들 때 생기는 단점은?',
    'SELECT가 항상 느려진다', '데이터가 사라질 수 있다', '테이블을 하나만 만들 수 있다', 'INSERT·UPDATE가 느려질 수 있다', 4,
    '데이터를 바꿀 때마다 인덱스도 함께 고쳐야 해서 쓰기 작업이 느려진다.'),
(7, 5, 3, '서브쿼리를 감쌀 때 쓰는 기호는?',
    '중괄호 { }', '괄호 ( )', '대괄호 [ ]', '작은따옴표 '' ''', 2,
    '서브쿼리는 괄호로 감싸서 바깥 쿼리 안에 넣는다.'),
(8, 6, 4, 'VLOOKUP의 마지막 인수를 FALSE로 두면?',
    '근사값을 찾는다', '대소문자를 구분한다', '정확히 일치하는 값만 찾는다', '오류가 난다', 3,
    'FALSE(또는 0)는 정확히 일치하는 값만 찾는다.'),
(9, 7, 5, '피벗 테이블에서 월별 합계를 보려면 날짜 필드를 어디에 넣을까?',
    '행 영역', '값 영역', '필터 영역', '피벗 테이블에는 넣을 수 없다', 1,
    '날짜를 행 영역에 넣고 월 단위로 그룹화하면 월별로 나뉜다. 합계를 낼 숫자는 값 영역에 넣는다.'),
(10, 8, 4, 'VLOOKUP 결과가 #N/A일 때 가장 흔한 원인은?',
    '셀 서식이 굵게 되어 있다', '시트 이름이 길다', '수식이 너무 짧다', '찾는 값이 범위의 첫 번째 열에 없다', 4,
    'VLOOKUP은 범위의 첫 번째 열에서만 값을 찾는다.');

-- 학습자는 1번, 3번 영상을 이미 봤다 → 추천에서 빠져야 함
INSERT INTO watch_history (user_id, video_id) VALUES
(@learner, 1),
(@learner, 3);
