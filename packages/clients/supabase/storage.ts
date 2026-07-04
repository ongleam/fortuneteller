// 생성 이미지 등 바이너리를 public Supabase Storage 버킷에 올리고 공개 URL을 돌려준다.
// 기존 anon 키를 재사용한다(새 env 불필요). RLS: 'ideal-types' 버킷 anon insert 정책 필요.
import { createClient } from "@supabase/supabase-js";

const BUCKET = "ideal-types";

// ponytail: 런타임 업로드 전용 경량 클라이언트. 세션/쿠키 불필요하므로 ssr 클라이언트 대신 직접 생성.
// 지연 생성 — import 시점이 아닌 최초 업로드 시점에 env 를 읽는다(테스트 import 안전).
function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/** 이미지 바이트를 public 버킷에 올리고 공개 URL을 반환한다. */
export async function uploadPublicImage(
  bytes: Uint8Array,
  contentType = "image/png",
): Promise<string> {
  const supabase = getClient();
  const ext = contentType.split("/")[1] || "png";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
