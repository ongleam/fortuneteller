-- FAQ 벡터 검색을 위한 RPC 함수 생성
CREATE OR REPLACE FUNCTION get_faqs_by_vector(
  query_embedding VECTOR(768),  -- 벡터 차원에 맞게 조정
  threshold FLOAT DEFAULT 0.7,
  results_limit INT DEFAULT 10
)
RETURNS TABLE (
  question TEXT,
  answer TEXT,
  similarity DOUBLE PRECISION
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    faqs.question,
    faqs.answer,
    (1 - (faqs.embedding <=> query_embedding))::DOUBLE PRECISION AS similarity
  FROM
    faqs
  WHERE
    1 - (faqs.embedding <=> query_embedding) >= threshold
  ORDER BY
    similarity DESC
  LIMIT
    results_limit;
END;
$$;