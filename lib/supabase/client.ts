/**
 * Supabase 표준 브라우저 클라이언트 (Supabase 자체 인증용)
 * 
 * 이 파일은 하위 호환성을 위해 유지됩니다.
 * 새로운 코드에서는 `@/lib/supabase/client-standard`를 사용하는 것을 권장합니다.
 * 
 * @deprecated 새로운 코드에서는 `createClient` from `@/lib/supabase/client-standard`를 사용하세요.
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 하위 호환성을 위한 기본 export (단일 인스턴스)
export const supabase = createClient();
