# Edu Shortform Frontend

직장인과 취업 준비생을 위한 직무 교육 숏폼 플랫폼의 프런트엔드입니다. 현재 `feature/login` 브랜치에서 로그인 관련 화면을 개발하고 있습니다.

## 현재 구현

| 기능 | 화면 및 동작 | 상태 |
| --- | --- | --- |
| 로그인 | 이메일·비밀번호 입력, 필수 항목 확인 | 화면 구현 완료, 백엔드 API 연결 전 |
| 회원가입 | 이름·이메일·비밀번호 입력, 비밀번호 일치 확인 | 화면 구현 완료, 계정 생성 API 연결 전 |
| 비밀번호 찾기 | 이메일 입력 화면 | 화면 구현 완료, 재설정 이메일 API 연결 전 |

화면 간 이동과 기본 입력 확인이 동작합니다. 실제 로그인·계정 생성·재설정 이메일 발송은 백엔드 API 연결 후 사용할 수 있습니다.

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| UI | React |
| 개발 서버·빌드 | Vite |
| 코드 검사 | ESLint |
| 패키지 관리 | npm |

## 실행 방법

`frontend` 폴더에서 실행합니다.

```bash
npm install
npm run dev
```

터미널에 표시된 로컬 주소를 브라우저에서 엽니다. 기본 주소는 `http://localhost:5173/`입니다.

## 주요 명령

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 배포용 프런트엔드 빌드 |
| `npm run lint` | ESLint 코드 검사 |
| `npm run preview` | 빌드 결과 미리보기 |

## 프로젝트 구조

```text
frontend/src/
├─ App.jsx                     # 프런트엔드 진입 화면
├─ App.css                     # 전역 스타일 초기화
├─ main.jsx                    # React 앱 시작점
└─ features/
   └─ login/
      ├─ index.js               # 로그인 기능 공개 진입점
      ├─ LoginFeature.jsx       # 로그인 관련 화면 전환
      ├─ login.css              # 로그인 기능 스타일
      ├─ components/
      │  ├─ AuthLayout.jsx      # 인증 화면 공통 레이아웃
      │  └─ TextField.jsx       # 공통 입력 필드
      └─ pages/
         ├─ LoginPage.jsx       # 로그인 화면
         ├─ SignupPage.jsx      # 회원가입 화면
         └─ ForgotPasswordPage.jsx # 비밀번호 찾기 화면
```

## 다음 작업

- 백엔드 세션 로그인 API 연결
- 회원가입 API 연결
- 비밀번호 재설정 API 연결
- 로그인 성공 후 홈 화면으로 이동
- 팀 프런트엔드 라우팅 및 공통 레이아웃과 통합

## 협업

기능별 브랜치에서 작업하고, 변경 내용을 확인한 뒤 커밋·push합니다. 기능 확인 후 Pull Request를 통해 `main`에 병합합니다.
