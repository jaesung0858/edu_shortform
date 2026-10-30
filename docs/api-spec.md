# 교육용 숏폼 플랫폼 API 명세서

작성 기준: 2026.10.29 / 현재 구현된 코드 및 로컬 서버

현재 구현된 회원, 관리자, 영상 업로드·검색·조회·삭제, 좋아요, 퀴즈·채점·추천 API를 정리했습니다.

## 1. 공통 사항

| 항목 | 내용 |
| --- | --- |
| 백엔드 주소 | `http://localhost:8080` |
| Swagger | `http://localhost:8080/swagger-ui/index.html` |
| 일반 요청·응답 | `application/json` |
| 로그인 요청 | `application/x-www-form-urlencoded` |
| 업로드 요청 | `multipart/form-data` |
| 인증 | 로그인 세션 쿠키 `JSESSIONID` (회원·관리자·영상·퀴즈 채점·추천 공통) |
| 권한 | 일반 회원 `USER`, 관리자 `ADMIN` |
| 날짜 형식 | `2026-10-24T12:00:00` 형태. `createdAt`에는 시간대 정보가 포함되지 않음 |

로그인 후 같은 세션 쿠키로 요청합니다. 업로더·풀이 회원·추천 대상 회원은 모두 로그인 정보로 정하며, 요청에서 회원 번호를 받지 않습니다.
본문이 없는 조회 요청에는 `Content-Type`이 필요하지 않습니다. JSON 응답을 받으려면 `Accept: application/json`을 사용합니다.
이 문서의 번호·파일명·날짜는 예시이며, 실제 값은 등록 결과에 따라 달라집니다.

### API 목록

| 번호 | Method | URL | 기능 | 인증 |
| --- | --- | --- | --- | --- |
| 1 | POST | `/api/users` | 회원가입 | 불필요 |
| 2 | POST | `/api/login` | 로그인 | 불필요 |
| 3 | POST | `/api/logout` | 로그아웃 | 세션 종료용 |
| 4 | GET | `/api/users/me` | 로그인 회원 정보 | 필요 |
| 5 | GET | `/api/admin/me` | 로그인 관리자 확인 | ADMIN |
| 6 | GET | `/api/admin/users` | 회원 목록·검색 | ADMIN |
| 7 | GET | `/api/video-categories` | 카테고리·개념 태그 조회 | 필요 |
| 8 | POST | `/api/video-categories` | 카테고리 추가 | 필요 |
| 9 | POST | `/api/video-categories/{categoryId}/tags` | 개념 태그 추가 | 필요 |
| 10 | POST | `/api/videos` | 영상 업로드 | 필요 |
| 11 | GET | `/api/videos` | 공개 영상 목록·제목 검색 | 불필요 |
| 12 | GET | `/api/users/me/videos` | 내 영상 목록 | 필요 |
| 13 | GET | `/api/videos/{videoId}` | 영상 상세 | 공개 영상은 불필요 |
| 14 | GET | `/api/videos/{videoId}/content` | 영상 재생 | 공개 영상은 불필요 |
| 15 | GET | `/api/videos/{videoId}/thumbnail` | 썸네일 조회 | 공개 영상은 불필요 |
| 16 | GET | `/health` | 서버 상태 확인 | 불필요 |
| 17 | GET | `/api/videos/{videoId}/quizzes` | 영상별 퀴즈 조회 | 불필요 |
| 18 | POST | `/api/quizzes/{quizId}/answer` | 퀴즈 채점·오답 기록 | 필요 |
| 19 | GET | `/api/videos/{videoId}/recommendations` | 관련 영상 추천 | 필요 |
| 20 | POST | `/api/videos/{videoId}/views` | 조회 수 증가 | 불필요 |
| 21 | GET | `/api/videos/{videoId}/like` | 내 좋아요 상태 | 필요 |
| 22 | PUT | `/api/videos/{videoId}/like` | 좋아요 | 필요 |
| 23 | DELETE | `/api/videos/{videoId}/like` | 좋아요 취소 | 필요 |
| 24 | DELETE | `/api/videos/{videoId}` | 내 영상 삭제 | 필요 |

로그인·로그아웃은 Spring Security에서 처리하므로 현재 Swagger 목록에는 표시되지 않습니다. 실제 연동에 사용하는 API라 함께 기재했습니다.

### 공통 오류 응답

입력값 오류나 조회 실패 등은 현재 Spring Boot 기본 오류 형식을 사용합니다.

```json
{
  "timestamp": "2026-10-24T03:15:13.262Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/videos"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| timestamp | string | 오류 발생 시각. `Z`는 UTC 기준 |
| status | integer | HTTP 상태 코드 |
| error | string | HTTP 오류 이름 |
| path | string | 요청 경로 |

현재 응답에는 필드별 검증 메시지나 별도의 업무 오류 코드가 포함되지 않습니다. 아래 오류 표는 각 상태가 발생하는 조건을 설명한 것입니다.
인증 필터가 반환하는 `401`과 JSON 방식 로그인 실패 `401`은 본문이 비어 있을 수 있습니다. 모든 오류가 위 JSON으로 내려오는 것은 아닙니다.

| HTTP 코드 | 의미 | 대표 발생 조건 |
| --- | --- | --- |
| 400 | Bad Request | 필수값 누락, 길이·범위 위반, 잘못된 JSON·숫자 |
| 401 | Unauthorized | 로그인 필요, 세션 만료, 로그인 실패 |
| 403 | Forbidden | 로그인했지만 관리자 권한 없음 |
| 404 | Not Found | 대상 없음, 접근할 수 없는 영상, 저장 파일 없음 |
| 409 | Conflict | 이메일·닉네임·분류 이름 중복 |
| 413 | Content Too Large | 업로드 용량 제한 초과 |
| 415 | Unsupported Media Type | 요청 Content-Type 또는 파일 형식 오류 |
| 416 | Range Not Satisfiable | 영상 파일의 요청 구간이 유효하지 않음 |
| 500 | Internal Server Error | DB 처리·파일 저장 등 서버 내부 실패 |

JSON 본문을 받는 API는 읽을 수 없는 JSON에 `400`, 지원하지 않는 Content-Type에 `415`가 발생할 수 있습니다.
서버 내부 실패 시의 `500`은 공통으로 적용하며, 아래에는 API별 주요 오류를 적었습니다.

## 2. 회원

### 1) 회원가입 — POST /api/users

인증 불필요 / 요청 `application/json` / 정상 응답 `201 Created`

**Request Body**

| 필드 | 타입 | 필수 | 제한 |
| --- | --- | --- | --- |
| email | string | O | 이메일 형식, 공백만 입력 불가, 최대 100자 |
| password | string | O | 8~24자, 공백을 제외한 ASCII 영문·숫자·특수문자만 허용 |
| nickname | string | O | 공백만 입력 불가, 최대 30자 |

```json
{
  "email": "member@example.com",
  "password": "Example123!",
  "nickname": "학습회원"
}
```

비밀번호에 한글·이모지·공백은 사용할 수 없습니다. 영문·숫자·특수문자를 반드시 모두 조합해야 하는 규칙은 현재 없습니다.
새 회원의 권한은 `USER`로 저장됩니다. 가입 시 `role`이나 회원 번호를 지정하지 않으며, 가입 후 자동 로그인은 하지 않습니다.

**Response — 201**

```json
{
  "userId": 4,
  "email": "member@example.com",
  "nickname": "학습회원"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| userId | integer(int64) | 생성된 회원 번호 |
| email | string | 가입 이메일 |
| nickname | string | 닉네임 |

비밀번호는 BCrypt로 암호화해 저장하며 응답에 포함하지 않습니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | 이메일 형식 오류, 필수값 누락, 비밀번호·닉네임 제한 위반 |
| 409 | 이미 사용 중인 이메일 또는 닉네임 |

### 2) 로그인 — POST /api/login

인증 불필요 / 요청 `application/x-www-form-urlencoded`

**Request**

| 위치 | 항목 | 타입 | 필수 | 내용 |
| --- | --- | --- | --- | --- |
| Header | Accept | string | API 사용 시 O | `application/json` |
| Form | username | string | O | 가입 이메일. 필드명은 `email`이 아닌 `username` |
| Form | password | string | O | 가입 시 설정한 비밀번호 |

```http
POST /api/login
Content-Type: application/x-www-form-urlencoded
Accept: application/json

username=member%40example.com&password=Example123%21
```

폼 값의 특수문자는 URL 인코딩해서 전달합니다. JSON 본문으로 로그인하지 않습니다.

**Response — 204 No Content**

본문 없음. 로그인 세션이 생성되며 세션 쿠키를 이후 요청에 사용합니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 401 | 이메일·비밀번호 불일치, 없는 회원, 삭제된 회원, 로그인 입력 누락 |

`Accept: application/json`이 없으면 브라우저 로그인 흐름으로 처리됩니다. 이 경우 성공 시 `/api/users/me`, 실패 시 `/login?error`로 `302` 이동합니다.
백엔드 기본 로그인 화면은 `GET /login`에서 열 수 있습니다.

### 3) 로그아웃 — POST /api/logout

**Request**: 본문 없음. 로그인 세션 쿠키를 함께 전송합니다.

**Response — 204 No Content**: 본문 없음. 현재 세션을 종료합니다.

별도 업무 오류 코드는 없습니다. 로그인하지 않은 상태의 요청도 `204`로 종료됩니다.

### 4) 로그인 회원 정보 — GET /api/users/me

세션 로그인 필요. 요청 파라미터·본문 없음.

**Response — 200 OK**

```json
{
  "userId": 4,
  "email": "member@example.com",
  "nickname": "학습회원",
  "role": "USER"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| userId | integer(int64) | 로그인 회원 번호 |
| email | string | 이메일 |
| nickname | string | 닉네임 |
| role | string | `USER` 또는 `ADMIN` |

| 오류 코드 | 발생 조건 |
| --- | --- |
| 401 | 로그인하지 않음, 세션 만료, 세션에 해당하는 회원이 없거나 삭제됨 |

## 3. 관리자

### 5) 관리자 확인 — GET /api/admin/me

`ADMIN` 권한 필요. 요청 파라미터·본문 없음.

**Response — 200 OK**

```json
{
  "username": "admin@example.com"
}
```

`username`은 string이며 현재 로그인한 관리자의 이메일입니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 401 | 로그인하지 않음 또는 세션 만료 |
| 403 | 로그인한 계정에 ADMIN 권한이 없음 |

### 6) 회원 목록·검색 — GET /api/admin/users

`ADMIN` 권한 필요.

**Request Query**

| 항목 | 타입 | 필수 | 기본값 | 내용 |
| --- | --- | --- | --- | --- |
| keyword | string | X | 빈 문자열 | 이메일 또는 닉네임의 부분 검색 |

요청 예: `/api/admin/users?keyword=example`

**Response — 200 OK**

```json
[
  {
    "userId": 4,
    "email": "member@example.com",
    "nickname": "학습회원",
    "role": "USER",
    "createdAt": "2026-10-24T12:00:00"
  }
]
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| userId | integer(int64) | 회원 번호 |
| email | string | 이메일 |
| nickname | string | 닉네임 |
| role | string | `USER` 또는 `ADMIN` |
| createdAt | string(date-time) | 가입 시각 |

삭제된 회원은 제외하며 회원 번호 오름차순으로 반환합니다. 검색어가 없으면 전체 목록, 결과가 없으면 `[]`입니다. 현재 페이지 구분은 없습니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 401 | 로그인하지 않음 또는 세션 만료 |
| 403 | ADMIN 권한이 없음 |

## 4. 카테고리·개념 태그

### 7) 분류 조회 — GET /api/video-categories

세션 로그인 필요. 요청 파라미터·본문 없음.

**Response — 200 OK**

```json
[
  {
    "categoryId": 1,
    "name": "데이터베이스",
    "tags": [
      { "tagId": 1, "name": "SQL JOIN" }
    ]
  }
]
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| categoryId | integer(int32) | 카테고리 번호 |
| name | string | 카테고리 이름 |
| tags | array | 해당 카테고리의 개념 태그 목록 |
| tags[].tagId | integer(int32) | 개념 태그 번호 |
| tags[].name | string | 개념 태그 이름 |

카테고리·태그 번호 오름차순입니다. 태그가 없는 카테고리는 `tags: []`, 카테고리가 전혀 없으면 최상위 `[]`를 반환합니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 401 | 로그인하지 않음 또는 세션 만료 |

### 8) 카테고리 추가 — POST /api/video-categories

세션 로그인 필요 / 요청 `application/json`

**Request Body**

| 필드 | 타입 | 필수 | 제한 |
| --- | --- | --- | --- |
| name | string | O | 공백만 입력 불가, 최대 30자 |

```json
{ "name": "개발 기초" }
```

**Response — 201 Created**

```json
{
  "categoryId": 7,
  "name": "개발 기초",
  "tags": []
}
```

응답 필드 형식은 분류 조회와 같습니다. 앞뒤 공백을 제거해 저장하며, 추가한 카테고리는 모든 회원이 함께 사용합니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | 이름 누락, 공백만 입력, 30자 초과 |
| 401 | 로그인하지 않음 또는 세션 만료 |
| 409 | 같은 카테고리 이름이 이미 등록됨 |

### 9) 개념 태그 추가 — POST /api/video-categories/{categoryId}/tags

세션 로그인 필요 / 요청 `application/json`

**Request**

| 위치 | 항목 | 타입 | 필수 | 내용 |
| --- | --- | --- | --- | --- |
| Path | categoryId | integer(int32) | O | 태그를 추가할 기존 카테고리 번호 |
| Body | name | string | O | 공백만 입력 불가, 최대 50자 |

요청 예: `POST /api/video-categories/7/tags`

```json
{ "name": "변수" }
```

**Response — 201 Created**

```json
{ "tagId": 12, "name": "변수" }
```

`tagId`는 integer(int32), `name`은 string입니다. 앞뒤 공백을 제거해 저장합니다. 같은 카테고리 안에서 이름이 중복될 수 없으며, 다른 카테고리에는 같은 이름을 사용할 수 있습니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | 이름 누락·공백·50자 초과, categoryId를 정수로 해석할 수 없음 |
| 401 | 로그인하지 않음 또는 세션 만료 |
| 404 | 해당 카테고리가 없음 |
| 409 | 같은 카테고리에 같은 태그 이름이 있음 |

## 5. 영상

### 10) 영상 업로드 — POST /api/videos

세션 로그인 필요 / 요청 `multipart/form-data`

**Request Parts**

| Part | 형식 | 필수 | 제한 |
| --- | --- | --- | --- |
| file | 영상 파일 | O | 비어 있지 않은 MP4, 최대 100MB |
| request | `application/json` | O | 아래 영상 등록 정보 |
| thumbnail | JPEG 이미지 | X | 비어 있지 않은 JPEG, 최대 1MB, 가로·세로 각각 1,920픽셀 이하 |

**request Part의 JSON**

| 필드 | 타입 | 필수 | 제한 |
| --- | --- | --- | --- |
| title | string | O | 공백만 입력 불가, 최대 100자 |
| description | string | X | 최대 1,000자, 생략 또는 null 가능 |
| categoryId | integer(int32) | O | 양수, DB에 존재하는 카테고리 |
| tagId | integer(int32) | O | 양수, 선택한 카테고리에 속하는 개념 태그 |
| durationSec | integer(int32) | O | 재생 길이(초), 1 이상 |

```json
{
  "title": "SQL JOIN 기초",
  "description": "INNER JOIN의 기본 개념을 설명합니다.",
  "categoryId": 1,
  "tagId": 1,
  "durationSec": 33
}
```

`request`는 문자열 폼 필드가 아니라 Content-Type이 `application/json`인 Part로 보냅니다. 전체 multipart 경계값은 브라우저·요청 도구가 생성하도록 합니다.
전체 요청 제한은 102MB입니다. MB 제한은 현재 설정상 1MB = 1,048,576바이트 기준입니다.

프론트에서 길이를 초 단위로 올림해 전달하고, 영상 약 0.5초 지점을 캡처한 JPEG를 함께 보냅니다. 서버가 영상 길이·썸네일을 직접 추출하는 방식은 아닙니다.
서버는 MP4 확장자와 앞부분의 `ftyp` 헤더를 검사하며 전체 코덱·재생 가능 여부를 검사하지는 않습니다.

**Response — 201 Created**

```json
{
  "videoId": 20,
  "title": "SQL JOIN 기초",
  "videoKey": "c25085f9-3c46-4f0b-a122-70d22e5b8622.mp4"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| videoId | integer(int64) | 생성된 영상 번호 |
| title | string | 등록된 제목 |
| videoKey | string | UUID로 생성한 저장 파일명. 재생 URL은 아님 |

업로더는 로그인 회원이며, 새 영상의 상태는 `PUBLIC`입니다. 썸네일 없이 등록할 수도 있습니다.
DB 등록이 롤백되면 저장한 영상·썸네일 파일을 정리합니다. 정리 실패 시에는 서버 로그를 남깁니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | file·request 누락, 빈 파일·썸네일, 필수값·길이·양수 제한 위반, 카테고리와 태그 불일치 |
| 401 | 로그인하지 않음, 세션 만료, 로그인 회원이 없거나 삭제됨 |
| 404 | 카테고리 또는 개념 태그가 없음 |
| 413 | 영상 100MB, 썸네일 1MB 또는 전체 요청 102MB 초과 |
| 415 | MP4 확장자·헤더 오류, JPEG 형식·해상도 제한 위반, request Part 등 Content-Type 오류 |
| 500 | 파일 저장 또는 DB 등록 실패 |

### 11) 공개 영상 목록·검색 — GET /api/videos

인증 불필요. 홈·탐색 화면에서 사용합니다.

**Request Query**

| 항목 | 타입 | 필수 | 기본값 | 제한·내용 |
| --- | --- | --- | --- | --- |
| page | integer(int32) | X | 0 | 0 이상. 한 페이지 12개 |
| categoryId | integer(int32) | X | 없음 | 양수. 생략하면 전체 카테고리 |
| keyword | string | X | 빈 문자열 | 최대 100자. 제목에 포함된 문자열 검색 |

요청 예: `/api/videos?page=0&categoryId=1&keyword=SQL`

검색어의 앞뒤 공백을 제거하고 영문 대소문자를 구분하지 않습니다. 생략하거나 공백만 보내면 전체 제목을 조회합니다.
`%`, `_`, `!`는 검색 패턴이 아닌 문자 그대로 검색하며, 카테고리 필터와 함께 사용할 수 있습니다. 설명·등록자·태그는 검색 대상이 아닙니다.

**Response — 200 OK**

```json
{
  "videos": [
    {
      "videoId": 20,
      "title": "SQL JOIN 기초",
      "creatorNickname": "학습회원",
      "categoryId": 1,
      "categoryName": "데이터베이스",
      "tagName": "SQL JOIN",
      "viewCount": 0,
      "likeCount": 0,
      "durationSec": 33,
      "createdAt": "2026-10-24T12:00:00",
      "status": "PUBLIC",
      "thumbnailUrl": "/api/videos/20/thumbnail"
    }
  ],
  "categories": [
    { "categoryId": 1, "name": "데이터베이스" }
  ],
  "hasNext": false
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| videos | array | 조회된 영상. 결과가 없으면 `[]` |
| videos[].videoId | integer(int64) | 영상 번호 |
| videos[].title | string | 제목 |
| videos[].creatorNickname | string | 등록 회원 닉네임 |
| videos[].categoryId | integer(int32) | 카테고리 번호 |
| videos[].categoryName | string | 카테고리 이름 |
| videos[].tagName | string | 개념 태그 이름 |
| videos[].viewCount | integer | 저장된 조회 수 |
| videos[].likeCount | integer | 저장된 좋아요 수 |
| videos[].durationSec | integer | 재생 길이(초) |
| videos[].createdAt | string(date-time) | 등록 시각 |
| videos[].status | string | 공개 목록에서는 `PUBLIC` |
| videos[].thumbnailUrl | string 또는 null | 썸네일 상대 경로. 키가 없으면 null |
| categories | array | 전체 공개 영상에 사용된 카테고리. 현재 page·categoryId 필터와 별개 |
| categories[].categoryId | integer(int32) | 카테고리 번호 |
| categories[].name | string | 카테고리 이름 |
| hasNext | boolean | 다음 페이지 존재 여부 |

등록 시각 내림차순이며 같은 시각이면 영상 번호 내림차순입니다. 숨김·삭제 영상과 삭제된 회원의 영상은 제외합니다.
다음 페이지는 `page`를 1 증가시켜 요청합니다. 전체 건수나 전체 페이지 수는 반환하지 않습니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | page가 음수, categoryId가 0 이하, 숫자 변환 실패, keyword 100자 초과 |

존재하지 않는 양수 categoryId나 목록 범위를 넘는 page는 오류가 아니라 빈 영상 배열을 반환합니다.

### 12) 내 영상 목록 — GET /api/users/me/videos

세션 로그인 필요.

**Request Query**

| 항목 | 타입 | 필수 | 기본값 | 내용 |
| --- | --- | --- | --- | --- |
| page | integer(int32) | X | 0 | 0 이상. 한 페이지 12개 |

회원 번호를 보내지 않습니다. 로그인 회원이 올린 공개·숨김 영상을 최신 등록순으로 조회하고 삭제 영상은 제외합니다.

**Response — 200 OK**

11번 공개 목록과 동일한 구조입니다. `status`에는 `PUBLIC` 또는 `HIDDEN`이 들어가고, `categories`는 항상 빈 배열입니다.

영상이 없는 경우:

```json
{
  "videos": [],
  "categories": [],
  "hasNext": false
}
```

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | page가 음수이거나 정수로 변환할 수 없음 |
| 401 | 로그인하지 않음, 세션 만료, 로그인 회원이 없거나 삭제됨 |

### 13) 영상 상세 — GET /api/videos/{videoId}

**Request Path**

| 항목 | 타입 | 필수 | 제한 |
| --- | --- | --- | --- |
| videoId | integer(int64) | O | 양수인 영상 번호 |

공개 영상은 인증 없이 조회합니다. 숨김 영상은 등록한 회원의 세션이 필요합니다. 관리자라도 다른 회원의 숨김 영상에 자동으로 접근할 수 있는 구조는 아닙니다.

**Response — 200 OK**

```json
{
  "videoId": 20,
  "title": "SQL JOIN 기초",
  "description": "INNER JOIN의 기본 개념을 설명합니다.",
  "creatorNickname": "학습회원",
  "categoryName": "데이터베이스",
  "tagName": "SQL JOIN",
  "viewCount": 0,
  "likeCount": 0,
  "durationSec": 33,
  "status": "PUBLIC",
  "videoUrl": "/api/videos/20/content",
  "thumbnailUrl": "/api/videos/20/thumbnail"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| videoId | integer(int64) | 영상 번호 |
| title | string | 제목 |
| description | string 또는 null | 영상 설명 |
| creatorNickname | string | 등록 회원 닉네임 |
| categoryName | string | 카테고리 이름 |
| tagName | string | 개념 태그 이름 |
| viewCount | integer | 저장된 조회 수 |
| likeCount | integer | 저장된 좋아요 수 |
| durationSec | integer | 재생 길이(초) |
| status | string | 접근 가능한 영상의 `PUBLIC` 또는 `HIDDEN` 상태 |
| videoUrl | string | MP4 파일을 요청할 상대 경로 |
| thumbnailUrl | string 또는 null | 썸네일 상대 경로. 키가 없으면 null |

목록·상세 조회 및 파일 재생 GET 요청만으로 조회 수가 증가하지는 않습니다. 재생 시작 시 20번 조회 수 증가 API를 별도로 호출합니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | videoId가 0 이하이거나 정수로 변환할 수 없음 |
| 404 | 영상 없음, 삭제 영상, 삭제 회원의 영상, 다른 회원의 숨김 영상 |

접근 불가도 `403`이 아닌 `404`로 처리합니다. 상세 정보가 있어도 실제 파일이 없으면 다음 재생 요청은 `404`가 될 수 있습니다.

### 14) 영상 파일 재생 — GET /api/videos/{videoId}/content

영상 상세와 같은 Path 파라미터·접근 조건을 사용합니다. 요청 본문 없음.

**선택 Request Header**

| 항목 | 타입 | 내용 |
| --- | --- | --- |
| Range | string | 원하는 바이트 구간. 예: `bytes=0-1023` |

**Response**

| 상태 | Content-Type | Body |
| --- | --- | --- |
| 200 OK | `video/mp4` | 전체 MP4 바이너리 |
| 206 Partial Content | `video/mp4` | 요청한 MP4 구간 바이너리 |

단일 구간 응답 예시입니다. 파일 크기는 예시입니다.

```http
HTTP/1.1 206 Partial Content
Content-Type: video/mp4
Accept-Ranges: bytes
Content-Range: bytes 0-1023/1011736
Content-Length: 1024
Cache-Control: no-store

(요청 구간의 영상 바이트)
```

JSON 응답이 아닙니다. 복수 구간을 요청하면 `multipart/byteranges` 형식으로 반환될 수 있습니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | videoId 형식·양수 제한 위반 |
| 404 | 접근 불가, 영상 없음, 저장 파일 없음 또는 읽을 수 없음 |
| 416 | 잘못된 Range 형식 또는 파일 범위를 벗어난 구간 |

### 15) 썸네일 조회 — GET /api/videos/{videoId}/thumbnail

영상 상세와 같은 Path 파라미터·접근 조건을 사용합니다. 요청 본문 없음.

**Response — 200 OK**

```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Cache-Control: no-store

(JPEG 이미지 바이트)
```

JSON 응답이 아닙니다. 썸네일이 없는 영상은 기본 이미지를 반환하지 않고 `404`를 반환합니다. 화면의 기본 이미지는 프론트에서 표시합니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | videoId 형식·양수 제한 위반 |
| 404 | 접근 불가, 영상 없음, 썸네일 키·파일 없음 또는 읽을 수 없음 |

## 6. 서버 상태

### 16) 상태 확인 — GET /health

인증 불필요. 요청 파라미터·본문 없음.

**Response — 200 OK**

```json
{ "status": "UP" }
```

`status`는 string입니다. 별도 업무 오류 코드는 없습니다. 이 API는 서버 응답 여부를 확인하며 DB·저장소 상태를 별도로 검사하지 않습니다.

## 7. 퀴즈·채점

담당: 김온

### 17) 영상별 퀴즈 조회 — GET /api/videos/{videoId}/quizzes

인증 불필요. 요청 본문 없음.

**Request Path**

| 항목 | 타입 | 필수 | 내용 |
| --- | --- | --- | --- |
| videoId | integer(int64) | O | 퀴즈를 조회할 영상 번호 |

요청 예: `/api/videos/1/quizzes`

**Response — 200 OK**

```json
[
  {
    "quizId": 1,
    "question": "INNER JOIN의 결과로 알맞은 것은?",
    "options": [
      "양쪽 테이블에서 조건이 일치하는 행",
      "왼쪽 테이블의 모든 행",
      "오른쪽 테이블의 모든 행",
      "두 테이블의 모든 조합"
    ]
  }
]
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| quizId | integer(int64) | 퀴즈 번호 |
| question | string | 문제 내용 |
| options | array of string | 1번부터 4번까지 순서대로 담은 보기 |

퀴즈 번호 오름차순으로 반환하며 정답·해설은 포함하지 않습니다. 첫 번째 보기를 선택했을 때 채점 요청의 `selectedNo`는 `1`입니다.
해당 영상에 퀴즈가 없으면 `[]`를 반환합니다. 영상이 없거나 공개 상태가 아니면(숨김·삭제, 업로더 탈퇴) `404`를 반환합니다. 영상 상세 API와 같은 기준입니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | videoId를 정수로 변환할 수 없음 |
| 404 | 영상이 없거나 공개 상태가 아님 |

### 18) 퀴즈 채점·오답 기록 — POST /api/quizzes/{quizId}/answer

요청 `application/json`. 로그인 필요. 풀이 기록은 로그인한 회원 기준으로 저장합니다.

**Request**

| 위치 | 항목 | 타입 | 필수 | 내용 |
| --- | --- | --- | --- | --- |
| Path | quizId | integer(int64) | O | 채점할 기존 퀴즈 번호 |
| Body | selectedNo | integer | O | 선택한 보기 번호, `1`~`4` |

```http
POST /api/quizzes/1/answer
Content-Type: application/json
Cookie: JSESSIONID=...

{ "selectedNo": 2 }
```

**Response — 200 OK**

정답이 1번인 문제에 2번을 제출한 경우의 예시입니다.

```json
{
  "correct": false,
  "answerNo": 1,
  "explanation": "INNER JOIN은 양쪽 테이블에서 조건이 일치하는 행을 반환합니다.",
  "tagName": "SQL JOIN",
  "addedToWrongNote": true
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| correct | boolean | 제출한 답의 정답 여부 |
| answerNo | integer | 실제 정답 번호, `1`~`4` |
| explanation | string 또는 null | 정답 해설 |
| tagName | string | 문제와 연결된 개념 태그 |
| addedToWrongNote | boolean | 오답이면 true, 정답이면 false |

정상 채점할 때마다 풀이 기록을 저장합니다. 오답은 오답 노트에 등록하고, 이미 같은 문항이 있으면 마지막 오답 시각을 갱신합니다.
`addedToWrongNote: true`는 새 행 생성뿐 아니라 기존 오답 노트 갱신도 포함합니다. 이후 정답을 맞혀도 기존 오답 노트를 자동 삭제하지는 않습니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | selectedNo 누락·null·1~4 범위 위반, quizId를 정수로 변환할 수 없음 |
| 401 | 로그인하지 않았거나 세션 만료, 탈퇴한 회원 |
| 404 | 퀴즈가 없음, 퀴즈의 영상이 공개 상태가 아님 |

## 8. 영상 추천

담당: 김온

### 19) 관련 영상 추천 — GET /api/videos/{videoId}/recommendations

요청 본문 없음. 로그인 필요. 로그인한 회원의 시청 기록을 기준으로 추천합니다.

**Request**

| 위치 | 항목 | 타입 | 필수 | 기본값 | 내용 |
| --- | --- | --- | --- | --- | --- |
| Path | videoId | integer(int64) | O | 없음 | 추천의 기준이 되는 영상 번호 |
| Query | correct | boolean | X | true | 직전 퀴즈 정답 여부. `true` 또는 `false` 사용 |

```http
GET /api/videos/1/recommendations?correct=false
Cookie: JSESSIONID=...
```

**Response — 200 OK**

```json
[
  {
    "videoId": 2,
    "title": "INNER JOIN과 LEFT JOIN",
    "thumbnailUrl": "/api/videos/2/thumbnail",
    "likeCount": 95,
    "reason": "틀린 개념 다시 보기"
  }
]
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| videoId | integer(int64) | 추천 영상 번호 |
| title | string | 영상 제목 |
| thumbnailUrl | string 또는 null | 썸네일 조회 주소. 썸네일이 없으면 null (영상 목록·상세 API와 같은 규칙) |
| likeCount | integer | 저장된 좋아요 수 |
| reason | string | 추천 이유 |

최대 3개를 반환하며 후보가 부족하면 더 적거나 `[]`일 수 있습니다. 기준 영상과 해당 회원의 시청 기록에 있는 영상은 추천에서 제외하며, 공개 영상 중 업로더가 탈퇴하지 않은 영상에서 선택합니다.

| correct | 우선 추천 | reason 예시 |
| --- | --- | --- |
| false | 같은 개념 태그 영상, 이어서 같은 카테고리의 다른 개념 영상 | `틀린 개념 다시 보기`, `같은 주제` |
| true 또는 생략 | 같은 카테고리의 다른 개념 영상, 이어서 같은 개념 태그 영상 | `이어서 배우기`, `같은 개념 더 보기` |
| 공통 | 후보가 부족하면 인기 영상으로 보충 | `인기 영상` |

관련 후보를 좋아요 수 내림차순·영상 번호 내림차순으로 최대 50개 조회한 뒤 개념 우선순위를 적용합니다. 이 안에서 최대 3개를 고르고, 모자라면 인기 영상으로 보충합니다.
현재 `correct`는 서버가 최근 채점 기록에서 가져오는 값이 아니라 요청자가 전달하는 값입니다.

테스트 SQL로 넣은 샘플 영상은 썸네일 키만 있고 실제 파일이 없어, `thumbnailUrl`로 조회하면 실패할 수 있습니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | videoId를 정수로 변환할 수 없음, correct를 boolean으로 변환할 수 없음 |
| 401 | 로그인하지 않았거나 세션 만료, 탈퇴한 회원 |
| 404 | 기준 영상이 없거나 공개 상태가 아님 |

## 9. 조회 수·좋아요·영상 삭제

담당: 박재성

### 20) 조회 수 증가 — POST /api/videos/{videoId}/views

인증 불필요. 공개 영상만 가능합니다. 요청 본문 없음.

**Request Path**

| 항목 | 타입 | 필수 | 내용 |
| --- | --- | --- | --- |
| videoId | integer(int64) | O | 양수인 공개 영상 번호 |

**Response — 200 OK**

```json
{ "videoId": 20, "viewCount": 1 }
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| videoId | integer(int64) | 영상 번호 |
| viewCount | integer | 증가 후 전체 조회 수 |

호출 한 번당 1 증가합니다. 동일 회원·브라우저의 중복 시청을 구분하지 않습니다.
프론트에서는 재생이 시작될 때 호출하며, 일시정지 후 재개나 구간 이동마다 반복 호출하지 않도록 연결해야 합니다.
영상 목록·상세·파일 GET 및 Range 요청은 집계를 증가시키지 않습니다. 이 API가 시청 기록을 저장하는 것은 아닙니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | videoId가 0 이하이거나 정수로 변환할 수 없음 |
| 404 | 없는 영상, 숨김·삭제 영상, 삭제된 회원의 영상 |

### 21) 내 좋아요 상태 — GET /api/videos/{videoId}/like

세션 로그인 필요. 공개 영상만 가능합니다. 요청 본문 없음.

**Request Path**

| 항목 | 타입 | 필수 | 내용 |
| --- | --- | --- | --- |
| videoId | integer(int64) | O | 양수인 공개 영상 번호 |

**Response — 200 OK**

```json
{ "videoId": 20, "liked": false, "likeCount": 0 }
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| videoId | integer(int64) | 영상 번호 |
| liked | boolean | 로그인한 회원의 좋아요 여부 |
| likeCount | integer | 영상의 전체 좋아요 수 |

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | videoId 형식·양수 제한 위반 |
| 401 | 로그인하지 않음, 세션 만료, 로그인 회원이 없거나 삭제됨 |
| 404 | 없는 영상, 숨김·삭제 영상, 삭제된 회원의 영상 |

### 22) 좋아요 — PUT /api/videos/{videoId}/like

세션 로그인 필요. Path와 오류 조건은 21번과 같으며 요청 본문은 없습니다.

```http
PUT /api/videos/20/like
Cookie: JSESSIONID=로그인한_세션값
```

**Response — 200 OK**

```json
{ "videoId": 20, "liked": true, "likeCount": 1 }
```

응답 필드는 21번과 같습니다. 회원 번호는 요청에서 받지 않습니다.
처음 요청하면 `video_like`에 기록을 추가하고 `video.like_count`를 1 증가시킵니다. 같은 회원이 반복 요청하면 기록·집계가 중복되지 않고 `200`을 반환합니다.

### 23) 좋아요 취소 — DELETE /api/videos/{videoId}/like

세션 로그인 필요. Path와 오류 조건은 21번과 같으며 요청 본문은 없습니다.

**Response — 200 OK**

```json
{ "videoId": 20, "liked": false, "likeCount": 0 }
```

응답 필드는 21번과 같습니다. 본인의 좋아요 기록이 있으면 삭제하고 전체 좋아요 수를 1 감소시킵니다.
이미 취소했거나 좋아요 기록이 없어도 `200`을 반환하며 집계는 줄이지 않습니다. 집계는 0 미만으로 내려가지 않습니다.
좋아요 기록 변경과 집계는 같은 트랜잭션으로 처리합니다. 영상 행과 해당 좋아요 기록을 잠가 동시 요청의 중복 반영을 막습니다.

테스트 SQL의 좋아요 수는 정렬 확인을 위해 넣은 숫자로 실제 좋아요 기록 수와 다릅니다. 이 API는 기존 집계를 초기화하지 않고 새 요청의 증감만 반영합니다.

### 24) 내 영상 삭제 — DELETE /api/videos/{videoId}

세션 로그인 필요. 영상 작성자만 삭제할 수 있습니다. 관리자도 다른 회원의 영상을 이 API로 삭제할 수 없습니다.

**Request Path**

| 항목 | 타입 | 필수 | 내용 |
| --- | --- | --- | --- |
| videoId | integer(int64) | O | 양수인 본인 영상 번호 |

요청 본문 없음. 본인의 공개·숨김 영상 모두 삭제할 수 있습니다.

**Response — 204 No Content**

본문 없음. `video.status`를 `DELETED`로 변경합니다.
DB 행, 영상·썸네일 파일과 기존 퀴즈·풀이·오답·좋아요·시청 기록은 유지합니다. 파일의 물리 삭제나 복구 API는 포함하지 않습니다.
삭제한 영상은 공개 목록·검색·내 영상 목록에서 제외되며, 상세·재생·썸네일·퀴즈·추천 요청에서도 접근할 수 없습니다.

| 오류 코드 | 발생 조건 |
| --- | --- |
| 400 | videoId 형식·양수 제한 위반 |
| 401 | 로그인하지 않음, 세션 만료, 로그인 회원이 없거나 삭제됨 |
| 403 | 다른 회원이 등록한 영상 |
| 404 | 없는 영상, 이미 삭제된 영상, 삭제된 회원의 영상 |

### 프론트 연결 항목

이번 변경은 백엔드만 반영했습니다. 화면에서는 다음 호출을 연결해야 합니다.

- 검색: 기존 `GET /api/videos`에 `keyword` 추가
- 재생 시작: `POST /api/videos/{videoId}/views` 호출
- 좋아요 표시: 로그인 후 `GET /api/videos/{videoId}/like` 조회
- 좋아요 버튼: `PUT`, 취소 버튼: `DELETE /api/videos/{videoId}/like`
- 내 영상 삭제: `DELETE /api/videos/{videoId}` 후 목록 갱신

검색은 Spring Data JPA의 [조회 쿼리](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html), 동시 요청 처리는 [Locking](https://docs.spring.io/spring-data/jpa/reference/jpa/locking.html)을 참고했습니다.

