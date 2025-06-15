# Factoreal Agent

## 프로젝트 개요

Factoreal Agent는 인증 및 채팅 기능을 제공하는 Next.js 기반의 웹 애플리케이션입니다. 사용자 인증, 채팅 인터페이스, 인증서 상세 정보 표시 등의 기능을 포함하고 있습니다.

## 시스템 아키텍처

### 디렉토리 구조

```
.
├── app/                    # Next.js 앱 라우터
│   ├── (auth)/            # 인증 관련 페이지
│   │   ├── api/           # 인증 API 엔드포인트
│   │   ├── login/         # 로그인 페이지
│   │   └── register/      # 회원가입 페이지
│   └── (chat)/            # 채팅 관련 페이지
│       ├── api/           # 채팅 API 엔드포인트
│       └── chat/          # 채팅 인터페이스
├── components/            # React 컴포넌트
│   ├── artifact/         # 아티팩트 관련 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   ├── chat/             # 채팅 관련 컴포넌트
│   ├── message/          # 메시지 관련 컴포넌트
│   ├── sidebar/          # 사이드바 컴포넌트
│   └── ui/               # UI 컴포넌트
├── lib/                  # 유틸리티 및 비즈니스 로직
│   ├── actions/          # 서버 액션
│   ├── agents/           # 에이전트 관련 로직
│   ├── ai/               # AI 관련 로직
│   ├── db/               # 데이터베이스 관련 로직
│   ├── schema/           # 데이터 스키마
│   └── utils/            # 유틸리티 함수
├── public/               # 정적 파일
└── utils/                # 전역 유틸리티
```

### 주요 기능

#### 1. 인증 시스템

- NextAuth.js를 사용한 인증 구현
- 로그인/회원가입 페이지
- 세션 관리 및 보안

#### 2. 채팅 시스템

- 실시간 채팅 인터페이스
- 파일 업로드 및 처리
- 채팅 기록 관리

#### 3. 인증서 관리

- 인증서 상세 정보 표시
- 인증서 검색 및 필터링
- 인증서 상태 관리

### 기술 스택

- **프론트엔드**: Next.js, React, TypeScript
- **스타일링**: Tailwind CSS
- **인증**: NextAuth.js
- **데이터베이스**: (사용 중인 DB 시스템)
- **API**: Next.js API Routes

### 주요 컴포넌트

#### 인증 관련

- `AuthForm`: 로그인/회원가입 폼
- `SubmitButton`: 제출 버튼 컴포넌트

#### 채팅 관련

- `ChatHeader`: 채팅 헤더
- `ChatInput`: 채팅 입력 컴포넌트
- `ChatMessage`: 채팅 메시지 컴포넌트

#### 인증서 관련

- `CertificationDetailModal`: 인증서 상세 정보 모달
- `KCTable`: 인증서 테이블 컴포넌트

### 개발 환경 설정

1. 저장소 클론

```bash
git clone [repository-url]
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

```bash
cp .env.example .env.local
```

4. 개발 서버 실행

```bash
npm run dev
```

### 배포

- Vercel을 통한 자동 배포
- 환경 변수 설정 필요

### 기여 방법

1. 이슈 생성
2. 브랜치 생성
3. 변경사항 커밋
4. Pull Request 생성

### 라이선스

[라이선스 정보]

---

이 README는 프로젝트의 기본적인 구조와 기능을 설명합니다. 더 자세한 정보나 특정 기능에 대한 설명이 필요하다면 알려주세요.
