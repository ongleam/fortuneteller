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

- `app/(auth)/` - Authentication pages and API routes
- `app/(root)/` - Main app pages including chat and Kakao callback API
- `lib/tools/` - AI tools: `saju.ts`, `fortune.ts`, `harmony.ts` for fortune-telling
- `lib/agents/base.ts` - Base AI agent configuration
- `lib/db/` - Database schema, queries, and migrations
- `lib/utils/saju.ts` - Core saju calculation utilities
- `components/chat/` - Chat interface components
- `config/prompts.ts` - Tool descriptions and prompts

### Important APIs

**Kakao Integration:**
- `/api/kakao/callback` - Handles Kakao chatbot responses with background processing
- Processes user messages through AI agent and returns formatted responses
- Manages chat history and user profiles

**Fortune-telling Tools:**
- `getSaju()` - Takes user birth data and returns saju analysis
- `getTodayFortune()` - Daily fortune based on stored user profile
- `getYearFortune()` - Yearly fortune predictions
- Tools expect Korean format dates and gender (`남성`/`여성`)

### Database Schema

Key tables managed through Drizzle:
- User profiles with birth data for saju calculations
- Chat messages with parts/attachments structure
- Kakao user integration

### Development Notes

- Uses `pnpm` as package manager
- TypeScript with strict configuration
- Tailwind CSS for styling with custom components in `components/ui/`
- Logs development output to `logs/debug.txt`
- Environment requires TLS disabled for local database operations
- Uses Korean language for user-facing content and fortune-telling responses

### Testing Strategy

- Jest for unit tests (focus on database queries)
- Playwright for e2e testing
- Promptfoo for AI prompt evaluation and testing
- Custom test fixtures and helpers in `test/` directory