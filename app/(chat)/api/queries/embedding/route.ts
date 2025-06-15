import { NextResponse } from 'next/server';
import { getEmbedding } from '@/lib/utils/embedding';

export async function POST(request: Request) {
  try {
    const { input, model } = await request.json();

    if (!input) {
      return NextResponse.json({ error: '입력 텍스트가 필요합니다.' }, { status: 400 });
    }

    const embedding = await getEmbedding(input, model);

    return NextResponse.json({
      embedding,
      model: model || 'text-multilingual-embedding-002',
    });
  } catch (error) {
    console.error('Embedding API 오류:', error);
    return NextResponse.json({ error: '임베딩 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
