class CustomEmbeddingProvider {
  constructor(options) {
    this.providerId = options.id || 'custom-embedding';
    this.config = options.config || {};
  }

  id() {
    return this.providerId;
  }

  async callEmbeddingApi(text) {
    const response = await fetch('http://localhost:3000/api/queries/embedding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-multilingual-embedding-002',
      }),
    });

    const data = await response.json();

    return {
      embedding: data.embedding,
      tokenUsage: {
        total: 0, // Vertex AI는 토큰 사용량을 제공하지 않음
        prompt: 0,
        completion: 0,
      },
    };
  }
}

module.exports = CustomEmbeddingProvider;
