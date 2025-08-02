// Quick test to verify the new import structure works
const path = require('path');

async function testNewStructure() {
  try {
    console.log('Testing new domain-driven architecture...');
    
    // Test core saju imports
    console.log('✓ Testing core/saju module...');
    const getSajuInfo = await import('./lib/core/saju/get-saju-info.ts');
    
    // Test shared types
    console.log('✓ Testing shared/types...');
    const sajuTypes = await import('./lib/shared/types/saju.ts');
    
    // Test infrastructure modules
    console.log('✓ Testing infrastructure modules...');
    const dbSchema = await import('./lib/infrastructure/db/schema.ts');
    
    console.log('✅ All imports successful! New structure is working.');
    console.log('\n📁 New lib structure:');
    console.log('├── core/                    # 핵심 비즈니스 로직');
    console.log('│   ├── saju/               # 사주 도메인');
    console.log('│   ├── chat/               # 채팅 도메인');
    console.log('│   └── profile/            # 프로필 도메인');
    console.log('├── infrastructure/         # 외부 의존성');
    console.log('│   ├── db/                 # 데이터베이스');
    console.log('│   ├── redis/              # 캐시');
    console.log('│   ├── supabase/           # Supabase');
    console.log('│   └── notion/             # Notion API');
    console.log('├── interfaces/             # 어댑터 계층');
    console.log('│   ├── tools/              # AI 도구');
    console.log('│   ├── actions/            # 서버 액션');
    console.log('│   └── agents/             # AI 에이전트');
    console.log('└── shared/                 # 공통 리소스');
    console.log('    ├── types/              # 타입 정의');
    console.log('    ├── constants/          # 상수');
    console.log('    └── utils/              # 유틸리티');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

testNewStructure();