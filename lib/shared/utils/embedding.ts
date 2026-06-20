// lib/utils/embedding.ts
import { vertex } from '@ai-sdk/google-vertex/edge';
import { google } from '@/lib/shared/utils/google-provider';
import { embed } from 'ai';

export async function getVertexEmbedding(
  query: string,
  model: string = 'text-multilingual-embedding-002'
) {
  const embeddingModel = vertex.textEmbeddingModel(model);

  try {
    const response = await embed({
      model: embeddingModel,
      value: query,
    });

    return response.embedding;
  } catch (error) {
    console.error('[ERROR] Embedding generation failed:', error);
    throw error;
  }
}

export async function getGoogleEmbedding(query: string, model: string = 'text-embedding-004') {
  const embeddingModel = google.textEmbeddingModel(model);

  try {
    const response = await embed({
      model: embeddingModel,
      value: query,
    });

    return response.embedding;
  } catch (error) {
    console.error('[ERROR] Embedding generation failed:', error);
    throw error;
  }
}

export const getEmbedding = getVertexEmbedding;
