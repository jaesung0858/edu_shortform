# DB 초기 생성 SQL

`01_schema.sql`은 2조 DB 명세서를 바탕으로 작성한 MySQL 8.0.16 이상용 초기 생성 스크립트입니다.
실행하면 `edu_shortform` DB와 다음 9개 테이블을 생성합니다.

`users`, `category`, `concept_tag`, `video`, `video_like`, `watch_history`, `quiz`, `quiz_attempt`, `wrong_note`

## 원본 명세서와의 차이

| 항목 | 반영 내용 |
| --- | --- |
| 회원 삭제 | `users.deleted_at` 추가. 삭제 시각을 기록하는 논리 삭제 방식으로 작성 |
| 복습 풀이 구분 | `quiz_attempt.is_review` 제외 |
| 복습 예약·완료 | `wrong_note.review_step`, `next_review_date`, `status` 제외. 오답 기록은 유지 |
| 데이터 검증 | 권한·영상 상태·보기 번호·정답 여부·영상 길이·집계 값에 CHECK 제약 추가 |

회원 활성화·비활성화 컬럼과 영상 난이도는 추가하지 않았습니다.
원본 PDF에는 위 변경 사항이 반영되어 있지 않습니다.

## 실행 방법

1. MySQL Workbench에서 로컬 서버에 접속합니다.
2. 연결된 서버 탭에서 `File > Open SQL Script`로 `01_schema.sql`을 엽니다. `unconnected` 탭에서는 실행할 수 없습니다.
3. 전체 스크립트를 실행합니다. 기본 단축키는 `Ctrl+Shift+Enter`입니다.
4. 아래 쿼리로 9개 테이블이 생성됐는지 확인합니다.

```sql
USE edu_shortform;
SHOW TABLES;
```

신규 DB에서 한 번만 실행합니다. 기존 테이블이 있으면 CREATE TABLE에서 오류가 나므로, 재실행 전 생성된 테이블과 오류 내용을 확인합니다.

이 스크립트에는 MySQL 접속 계정·비밀번호와 테스트 데이터가 없습니다.

## 테스트 회원 입력

DB 생성 후 `02_test_users.sql`을 연결된 쿼리 창에서 한 번 실행합니다.
기존 회원은 변경하지 않으며, 재실행 시 중복 이메일·닉네임 오류가 발생합니다.

| 이메일 | 역할 |
| --- | --- |
| `admin@example.com` | `ADMIN` |
| `learner@example.com` | `USER` |
| `creator@example.com` | `USER` |

세 계정은 로컬 개발용이며 공통 비밀번호는 `EduTest123!`입니다. DB에는 평문 대신 검증한 BCrypt 해시를 저장합니다.
서비스 테스트 회원의 비밀번호이며 MySQL `root` 접속 비밀번호와는 별개입니다.

Spring Boot 로그인과 관리자 회원 조회는 이 DB를 사용합니다. 위 계정은 테스트용이며, 회원가입 API로 추가한 계정도 로그인할 수 있습니다.

## DB 사용 규칙

- 회원 삭제 시 `deleted_at`을 기록합니다. 회원 목록과 로그인·인증 처리에서 삭제된 회원을 제외해야 합니다. 삭제된 회원의 이메일·닉네임은 UNIQUE 제약상 그대로 예약됩니다.
- 외래키는 연결된 기록의 물리 삭제를 제한합니다. 회원과 영상 삭제는 삭제 표시를 통해 처리합니다.
- `watch_history`는 회원·영상당 한 줄을 유지하고, 재시청 시 `watched_at`을 갱신합니다.
- 좋아요 기록과 `video.like_count`는 같은 트랜잭션에서 갱신합니다. 조회수는 별도 증가 처리가 필요합니다.
- 영상 카테고리와 개념 태그의 카테고리가 일치하는지 검증합니다. 영상·퀴즈 태그의 일치 정책도 팀에서 정합니다.
- 영상당 퀴즈 1~2문항 제한은 퀴즈 등록 API 구현 시 검증해야 합니다.
- 정답 비교와 `quiz_attempt.is_correct` 값은 서버에서 계산합니다.
- 현재 영상은 로컬에 저장하며, DB 등록 실패 시 저장한 파일을 정리합니다. 퀴즈 등록과 외부 저장소 연결은 후속 작업입니다.

AI 활용: SQL 작성과 제약조건 검토에 Codex를 사용했습니다.
