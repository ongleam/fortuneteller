import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getEmbedding } from '@/lib/utils/embedding'; // 이 함수도 Edge 호환되어야 함

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Edge에서는 Supabase 클라이언트를 각 요청 핸들러 내에서 생성하거나,
// 모듈 스코프에 생성하되 서비스 키를 사용하고 persistSession: false 옵션을 줍니다.
// 이 예제에서는 모듈 스코프에 한 번만 생성합니다.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const DEFAULT_MATCH_THRESHOLD = 0.7;
const DEFAULT_MATCH_COUNT = 5;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const thresholdParam = searchParams.get('threshold');
  const countParam = searchParams.get('count');

  console.log(`[INFO] get-faqs-by-vector: ${query}`);

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const threshold = thresholdParam ? parseFloat(thresholdParam) : DEFAULT_MATCH_THRESHOLD;
  const count = countParam ? parseInt(countParam, 10) : DEFAULT_MATCH_COUNT;

  try {
    const queryEmbedding = await getEmbedding(query); // 이 함수가 Edge에서 동작해야 함
    if (!queryEmbedding) {
      return NextResponse.json({ error: 'Failed to generate query embedding' }, { status: 500 });
    }

    // 방법 1: Supabase RPC 직접 호출 (lib/supabase/queries.ts의 로직을 여기로 가져옴)
    const { data, error: rpcError } = await supabaseAdmin.rpc('get_faqs_by_vector', {
      // RPC 함수 이름 확인 필요
      query_embedding: queryEmbedding,
      threshold: threshold,
      results_limit: count,
    });

    if (rpcError) {
      console.error('Error calling Supabase RPC get_faqs_by_vector:', rpcError);
      return NextResponse.json(
        { error: 'Failed to fetch certifications via RPC', details: rpcError.message },
        { status: 500 }
      );
    }
    return NextResponse.json(data as any[]);
  } catch (error: any) {
    console.error('Error in /api/queries/get_faqs_by_vector:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}
