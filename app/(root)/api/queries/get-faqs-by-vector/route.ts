import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getEmbedding } from '@/lib/utils/embedding'; // This function must also be Edge compatible

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// In Edge, create the Supabase client within each request handler, or
// create it in module scope, use the service key, and set the persistSession: false option.
// In this example, it is created only once in module scope.
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
    const queryEmbedding = await getEmbedding(query); // This function must also be Edge compatible
    if (!queryEmbedding) {
      return NextResponse.json({ error: 'Failed to generate query embedding' }, { status: 500 });
    }

    // Method 1: Direct Supabase RPC call (logic from lib/supabase/queries.ts is brought here)
    const { data, error: rpcError } = await supabaseAdmin.rpc('get_faqs_by_vector', {
      // RPC function name needs confirmation
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
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in /api/queries/get_faqs_by_vector:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}
