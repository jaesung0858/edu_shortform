# 영상 업로드

Spring 공식 [Uploading Files](https://spring.io/guides/gs/uploading-files/)와
[Multipart 요청 처리](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/multipart-forms.html)를 참고했습니다.
`MultipartFile`로 받은 파일을 `Files.copy`로 저장하고, 기존 `video` 테이블에 영상 정보를 등록합니다.

## 요청

- `POST /api/videos`
- `Content-Type: multipart/form-data`
- 기존 세션 로그인 필요. 업로더 번호는 로그인한 회원에서 가져옵니다.
- `file` 부분에 영상 파일을, `request` 부분에 아래 영상 정보 JSON을 넣습니다.
- `request` 부분의 Content-Type은 `application/json`입니다. Swagger에 이 형식을 설정해 두었습니다.

| 항목 | 필수 | 내용 |
| --- | --- | --- |
| file | O | MP4 파일, 최대 100MB |
| thumbnail | X | JPEG 이미지, 최대 1MB, 가로·세로 각 1,920픽셀 이하 |
| title | O | 제목, 공백만으로 입력 불가, 최대 100자 |
| description | X | 설명, 최대 1,000자 |
| categoryId | O | DB에 존재하는 카테고리 번호 |
| tagId | O | 해당 카테고리에 속한 개념 태그 번호 |
| durationSec | O | 재생 길이(초), 1 이상 |

`request` 입력 예시:

```json
{
  "title": "SQLD 기초",
  "description": "테스트 영상입니다.",
  "categoryId": 1,
  "tagId": 1,
  "durationSec": 60
}
```

프론트에서는 브라우저의 영상 메타데이터로 길이를 자동으로 읽고 초 단위로 올림해 `durationSec`에 전달합니다.
사용자가 길이를 직접 입력하지 않습니다. 서버는 전달받은 값을 저장하며 길이나 코덱을 별도로 추출하지는 않습니다.
MP4 확장자와 파일 앞부분의 `ftyp` 헤더를 확인하며, 전체 파일의 재생 가능 여부를 검사하는 것은 아닙니다.

프론트는 영상의 약 0.5초 지점(1초보다 짧으면 재생 길이의 절반)을 캡처합니다.
캡처 이미지는 원래 비율을 유지하며 긴 변이 최대 480픽셀인 JPEG로 만들어 `thumbnail` 부분에 함께 전송합니다.
[영상 구간 이동 완료 이벤트](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/seeked_event) 후
[Canvas 이미지 변환](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)으로 생성합니다.
서버는 이미지 형식·크기·해상도를 검사하고 JPEG로 다시 저장한 파일명을 `thumbnail_key`에 기록합니다.
기존 API와의 호환을 위해 썸네일 없이 업로드해도 등록할 수 있습니다.

## 응답

정상 등록 시 `201 Created`를 반환합니다. 번호와 저장 파일명은 등록 시 생성됩니다.

```json
{
  "videoId": 10,
  "title": "SQL JOIN 기초",
  "videoKey": "c25085f9-3c46-4f0b-a122-70d22e5b8622.mp4"
}
```

`videoKey`는 저장 파일명입니다. 재생 요청은 이 파일명 대신 영상 번호를 사용합니다.

## 영상 목록

[Spring Data의 페이징 조회](https://docs.spring.io/spring-data/jpa/reference/repositories/query-methods-details.html)를 사용합니다.

`GET /api/videos?page=0&categoryId=1`로 공개 영상을 최신 등록순으로 조회합니다.
로그인 없이 조회할 수 있으며, 12개씩 반환합니다. `categoryId`를 생략하면 전체 분류를 조회합니다.
숨김·삭제 영상과 삭제된 회원의 영상은 제외합니다.

- `videos`: videoId, title, creatorNickname, categoryId, categoryName, tagName, viewCount, likeCount, durationSec, createdAt, status, thumbnailUrl
- `categories`: 공개 영상이 있는 카테고리의 categoryId, name
- `hasNext`: 다음 목록 존재 여부
- 잘못된 page나 categoryId는 400을 반환합니다. page는 0 이상, categoryId는 양수입니다.

홈·탐색에서 이 API를 사용합니다. 업로드 후 해당 메뉴로 이동하거나 새로고침하면 등록한 영상을 확인할 수 있습니다.

## 영상 재생과 내 영상

| 요청 | 정상 응답 | 오류 |
| --- | --- | --- |
| GET /api/videos/{videoId} | 200, 영상 정보와 videoUrl | 400: 잘못된 번호, 404: 영상 없음·접근 불가 |
| GET /api/videos/{videoId}/content | 200: MP4 전체, 206: 요청한 구간 | 400: 잘못된 번호, 404: 파일 없음·접근 불가, 416: 범위 초과 |
| GET /api/videos/{videoId}/thumbnail | 200: JPEG 이미지 | 400: 잘못된 번호, 404: 썸네일 없음·접근 불가 |
| GET /api/users/me/videos?page=0 | 200, 내 영상 목록과 hasNext | 400: 잘못된 page, 401: 로그인 필요 |

상세 응답은 videoId, title, description, creatorNickname, categoryName, tagName, viewCount, likeCount, durationSec, status, videoUrl, thumbnailUrl을 반환합니다.
videoUrl은 `/api/videos/영상번호/content` 형식입니다. 목록의 카드를 누르면 `/videos/영상번호` 화면에서 해당 파일을 재생합니다.
[Spring MVC의 구간 요청 처리](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-range.html)를 사용해 재생바 이동을 지원합니다.

공개 영상은 로그인 없이 재생할 수 있습니다. 숨김 영상은 작성자만 조회·재생할 수 있고 삭제 영상과 삭제된 회원의 영상은 제공하지 않습니다.
내 영상 목록은 클라이언트가 보낸 회원 번호가 아닌 로그인 세션으로 조회합니다. 공개·숨김 영상을 포함하며 12개씩 불러옵니다.
기존 SQL 샘플 중 실제 파일이 없는 영상은 제목이 조회되더라도 재생 시 404를 반환합니다.

| 상태 코드 | 발생 조건 |
| --- | --- |
| 400 | 필수 항목 누락, 글자 수·숫자 제한 위반, 빈 파일, 카테고리와 태그 불일치 |
| 401 | 로그인하지 않았거나 세션의 회원이 삭제됨 |
| 404 | 카테고리 또는 개념 태그가 없음 |
| 413 | 영상 100MB, 썸네일 1MB 또는 전체 요청 102MB 초과 |
| 415 | MP4 확장자·헤더 오류, JPEG 형식·해상도 제한 위반 또는 잘못된 Content-Type |
| 500 | 파일 저장 또는 DB 등록 실패 |

## 저장 위치

기본값은 서버 실행 폴더의 `uploads/`입니다. `backend`에서 서버를 실행하면 `backend/uploads/`에 저장됩니다.
환경변수 `VIDEO_STORAGE_LOCATION`으로 경로를 변경할 수 있습니다.

파일명은 UUID로 새로 생성합니다. 서버를 다시 시작해도 파일을 유지하며, DB 트랜잭션이 롤백되면 저장한 파일을 삭제합니다.
파일 정리에 실패한 경우에는 서버 로그에 파일명을 남깁니다. `uploads/`는 기존 Git 제외 설정에 포함돼 있습니다.
영상은 `.mp4`, 썸네일은 `.jpg`로 저장합니다. DB 등록이 롤백되면 두 파일을 모두 정리합니다.
기존에 등록된 영상의 썸네일은 자동으로 생성하지 않으며, 썸네일이 없으면 목록에 기본 이미지를 표시합니다.

## 확인 방법

프론트 화면에서는 `http://localhost:5173/signup`에서 회원가입 후 로그인하면 홈으로 이동합니다. 내 채널 메뉴에서 업로드할 수 있습니다.
기존 회원은 `http://localhost:5173/login`에서 로그인합니다.
파일을 선택하면 영상 길이가 자동으로 표시됩니다. 카테고리와 개념 태그를 선택하고 영상을 등록하면 됩니다.
원하는 분류가 없으면 `새 카테고리` 또는 `새 태그`로 직접 추가할 수 있습니다. 추가한 항목은 자동으로 선택됩니다.
카테고리는 30자, 태그는 50자까지 입력할 수 있으며 등록한 분류는 다른 회원도 함께 사용합니다.

프론트에서 사용하는 인증 API:

| 요청 | 입력 | 정상 응답 | 오류 |
| --- | --- | --- | --- |
| POST /api/login | 폼 데이터 `username`(이메일), `password`. Accept: application/json | 204, 세션 쿠키 | 401: 로그인 실패 |
| GET /api/users/me | 세션 쿠키 | 200, userId·email·nickname·role | 401: 로그인 필요 |
| POST /api/logout | 세션 쿠키 | 204, 세션 종료 | — |
| GET /api/video-categories | 세션 쿠키 | 200, categoryId·name·tags(tagId·name) 목록 | 401: 로그인 필요 |
| POST /api/video-categories | 세션 쿠키, JSON `{"name":"개발 기초"}` | 201, categoryId·name·tags | 400: 빈 이름·30자 초과, 401: 로그인 필요, 409: 이름 중복 |
| POST /api/video-categories/{categoryId}/tags | 세션 쿠키, JSON `{"name":"변수"}` | 201, tagId·name | 400: 빈 이름·50자 초과, 401: 로그인 필요, 404: 카테고리 없음, 409: 같은 카테고리의 태그 이름 중복 |

아래는 Swagger에서 직접 확인하는 방법입니다.

1. 기존 SQL의 01 → 02 → 03을 실행한 DB로 백엔드를 시작합니다.
2. `http://localhost:8080/login`에서 기존 테스트 회원으로 로그인합니다.
3. 같은 브라우저에서 `http://localhost:8080/swagger-ui/index.html`을 엽니다.
4. `POST /api/videos`의 `Try it out`을 눌러 `file`에 실제 MP4 파일을 선택하고 `request`에 영상 정보 JSON을 넣습니다.
5. 테스트 데이터 기준 `categoryId=1`, `tagId=1`을 사용하고 재생 길이를 초 단위로 입력합니다.
6. 201 응답, `uploads/`의 파일, DB 등록 결과를 확인합니다.

```sql
SELECT video_id, creator_id, title, video_key, duration_sec, created_at
FROM video
ORDER BY video_id DESC;
```

AI 활용: 공식 문서를 참고한 업로드 코드 작성, 회원가입·로그인·업로드 화면의 API 연결과 오류 수정, 테스트 작성에 Codex를 활용했습니다.
