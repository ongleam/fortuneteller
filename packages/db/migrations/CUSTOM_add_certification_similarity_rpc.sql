-- 이전에 있다면 삭제
DROP FUNCTION IF EXISTS get_certifications_by_similarity;

-- 함수 생성
CREATE OR REPLACE FUNCTION get_certifications_by_similarity(
  query_category TEXT,
  similarity_threshold FLOAT DEFAULT 0.7,
  results_limit INT DEFAULT NULL
)

RETURNS TABLE (
  id UUID,
  idx INTEGER,
  category TEXT,
  factor TEXT,
  certifications TEXT[],
  similarity DOUBLE PRECISION,
  detail_ids UUID[],
  purchase_agency TEXT[],
  keywords TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc_certifications.id,
    kc_certifications.idx,
    kc_certifications.category,
    kc_certifications.factor,
    kc_certifications.certifications,
    similarity(kc_certifications.category, query_category) ::DOUBLE PRECISION AS similarity,
    kc_certifications.detail_ids,
    kc_certifications.purchase_agency,
    kc_certifications.keywords
  FROM
    kc_certifications
  WHERE
    similarity(kc_certifications.category, query_category) > similarity_threshold
  ORDER BY
    similarity DESC
  LIMIT results_limit;
END;
$$;