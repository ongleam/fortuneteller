# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Common Scripts
- `pnpm dev` - Start development server with turbo and logging to logs/debug.txt
- `pnpm build` - Run database migrations and build Next.js app
- `pnpm start` - Start production server
- `pnpm format` - Format code with Prettier

### Database Operations
- `pnpm db:generate` - Generate Drizzle schema
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio (with TLS disabled)
- `pnpm db:push` - Push schema changes to database
- `pnpm db:pull` - Pull schema from database

### Testing
- `pnpm test:jest` - Run Jest tests for Supabase queries
- `pnpm test:playwright` - Run Playwright e2e tests
- `pnpm test:promptfoo` - Run prompt evaluation tests
- `pnpm test:promptfoo:view` - View prompt test results

## Project Architecture

This is a Next.js 15 fortune-telling/saju (Korean traditional fortune-telling) chatbot application that integrates with Kakao chatbot API.

### Key Components

**Core Architecture:**
- Next.js App Router with grouped routes: `(auth)` and `(root)`
- Supabase for database with Postgres
- Drizzle ORM for type-safe database operations
- AI SDK for LLM integration with tools
- Redis for caching (Upstash)

**Main Features:**
- Saju (사주) fortune-telling with birth data analysis
- Kakao chatbot integration with skill responses
- User profile management and chat history
- AI agent with specialized tools for fortune-telling

### Directory Structure

**Current Structure (마이그레이션 예정):**
- `app/(auth)/` - Authentication pages and API routes
- `app/(root)/` - Main app pages including chat and Kakao callback API
- `lib/tools/` - AI tools: `saju.ts`, `fortune.ts`, `harmony.ts` for fortune-telling
- `lib/agents/base.ts` - Base AI agent configuration
- `lib/db/` - Database schema, queries, and migrations
- `lib/utils/saju.ts` - Core saju calculation utilities
- `components/chat/` - Chat interface components
- `config/prompts.ts` - Tool descriptions and prompts

**Recommended Future Structure (도메인 중심 아키텍처):**
```
lib/
├── core/                    # 핵심 비즈니스 로직 (도메인별 분리)
│   ├── saju/               # 사주 도메인: 계산 로직, 유효성 검증, 변환 로직
│   ├── chat/               # 채팅 도메인: 메시지 처리, 세션 관리
│   └── profile/            # 프로필 도메인: 사용자 정보, 설정 관리
├── infrastructure/         # 외부 의존성 및 데이터 접근 계층
│   ├── db/                 # 데이터베이스 스키마, 마이그레이션
│   ├── redis/              # 캐시 관리
│   ├── supabase/           # Supabase 클라이언트 및 쿼리
│   └── notion/             # Notion API 통합
├── interfaces/             # 어댑터 계층 (외부 인터페이스)
│   ├── tools/              # AI 도구 (AI SDK 통합)
│   ├── actions/            # 서버 액션 (Next.js)
│   └── agents/             # AI 에이전트 설정
├── shared/                 # 공통 유틸리티 및 공유 리소스
│   ├── types/              # TypeScript 타입 정의
│   ├── constants/          # 애플리케이션 상수
│   └── utils/              # 순수 유틸리티 함수
└── response/               # 응답 처리 및 포맷팅
```

**마이그레이션 원칙:**
- 도메인별 응집성: 관련 기능을 같은 도메인 폴더에 배치
- 의존성 방향: core ← infrastructure, interfaces → core
- 관심사 분리: 비즈니스 로직과 인프라 코드 분리
- 확장성: 새로운 도메인이나 기능 추가 시 명확한 배치 위치

### Important APIs

**Kakao Integration:**
- `/api/kakao/callback` - Handles Kakao chatbot responses with background processing and timeout handling
- Processes user messages through AI agent and returns formatted responses
- Manages chat history and user profiles with `user_kakao_id` integration
- Supports quick replies and interactive UI elements
- Background task processing with configurable callback URLs
- Message format conversion between DB and UI structures

**Fortune-telling Tools:**
- `getSaju()` - Takes user birth data and returns saju analysis (can accept user input parameters or use stored profile)
- `getUserSaju()` - Retrieves stored saju information for existing users
- `updateSajuProfile()` - Updates/stores user birth data and saju information in profile
- `getTodayFortune()` - Daily fortune based on stored user profile
- `getYearFortune()` - Yearly fortune predictions
- `getHarmony()` - Analyzes compatibility between two people based on their saju information
- Tools expect Korean format dates and gender (`남성`/`여성`)
- Tools support both kakao_user_id for Kakao integration and standalone usage

### Database Schema

Key tables managed through Drizzle:
- `profiles` - User profiles with birth data for saju calculations, includes `user_kakao_id` for Kakao integration
- `chats` - Chat conversations with `channel` field for different communication channels
- `messages` - Chat messages with parts/attachments structure
- `votes` - User interaction tracking

### Development Notes

- Uses `pnpm` as package manager
- TypeScript with strict configuration
- Tailwind CSS for styling with custom components in `components/ui/`
- Logs development output to `logs/debug.txt`
- Environment requires TLS disabled for local database operations (`NODE_TLS_REJECT_UNAUTHORIZED=0`)
- Uses Korean language for user-facing content and fortune-telling responses
- Background processing for Kakao API with timeout handling (1000ms)
- Markdown removal utilities for clean message formatting
- Supports quick replies and interactive elements for Kakao chatbot

### File Encoding Guidelines

- **ALWAYS use UTF-8 encoding** for all text files, especially those containing Korean text
- When creating or editing files with Korean content, ensure proper UTF-8 encoding to prevent character corruption
- Verify Korean text displays correctly after file operations
- If Korean text appears garbled or corrupted, recreate the file with proper UTF-8 encoding
- Use consistent encoding across all documentation files (`.md`, `.txt`, etc.)

### Code Design Principles

**Function-First Design (함수 중심 설계):**
- **PREFER functions over classes** whenever possible for better modularity and testability
- Use pure functions that are predictable, testable, and side-effect free
- Organize code into small, composable functions rather than large class hierarchies
- Each function should have a single responsibility and clear input/output contract

**Function Design Guidelines:**
```typescript
// ✅ GOOD: Pure function with clear purpose
export function calculateSajuPillars(birthData: BirthInput): SajuPillars {
  // Single responsibility, no side effects, predictable output
}

// ✅ GOOD: Composed functions for complex operations
export function getSajuAnalysis(birthData: BirthInput): SajuAnalysis {
  const pillars = calculateSajuPillars(birthData);
  const elements = analyzeElements(pillars);
  const fortune = calculateFortune(pillars);
  return combineAnalysis(pillars, elements, fortune);
}

// ❌ AVOID: Large classes with multiple responsibilities
class SajuCalculator {
  calculatePillars() { /* ... */ }
  analyzeElements() { /* ... */ }
  calculateFortune() { /* ... */ }
  generateReport() { /* ... */ }
  saveToDatabase() { /* ... */ }
}
```

**When to Use Classes vs Functions:**
- **Use functions for**: Business logic, calculations, data transformations, utilities
- **Use classes for**: UI components (React), database models, API clients with state
- **Consider objects for**: Configuration, data containers, complex state management

**Module Organization:**
- Group related functions in modules rather than classes
- Export individual functions for better tree-shaking and testing
- Use namespace objects sparingly, prefer direct function exports
- Keep side effects isolated in separate modules (database, API calls)

**Import Guidelines:**
- **ALWAYS use absolute imports** with the `@/` alias instead of relative imports
- ✅ GOOD: `import { calculateSaju } from '@/lib/utils/saju'`
- ❌ AVOID: `import { calculateSaju } from '../../utils/saju'`
- This improves code readability and prevents import path issues when files are moved
- Absolute imports make dependency relationships clearer and more maintainable

**Refactoring Guidelines:**
- **ALWAYS refactor existing functions in-place** rather than creating new files
- Preserve existing function signatures to maintain compatibility with tests and imports
- When splitting large functions, extract helper functions within the same file first
- Only create new files when adding entirely new functionality or domains
- Maintain git history by editing existing files instead of recreating them
- Update imports and exports gradually to avoid breaking existing code
- Run tests after refactoring to ensure compatibility is maintained

### Testing Strategy

- Jest for unit tests (focus on database queries)
- Playwright for e2e testing
- Promptfoo for AI prompt evaluation and testing
- Custom test fixtures and helpers in `test/` directory