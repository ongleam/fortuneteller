import { NextResponse } from 'next/server';
import { getEmbedding } from '@/lib/utils/embedding';

export async function POST(request: Request) {
  try {
    const { input, model } = await request.json();

    if (!input) {
      return NextResponse.json({ error: 'Input text is required.' }, { status: 400 });
    }

    const embedding = await getEmbedding(input, model);

    return NextResponse.json({
      embedding,
      model: model || 'text-multilingual-embedding-002',
    });
  } catch (error) {
    console.error('Embedding API error:', error);
    return NextResponse.json({ error: 'An error occurred while generating the embedding.' }, { status: 500 });
  }
}
