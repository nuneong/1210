import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component 및 Server Actions용)
 *
 * 2025년 4월부터 권장되는 방식:
 * - JWT 템플릿 불필요
 * - Clerk 토큰을 Supabase가 자동 검증
 * - auth().getToken()으로 현재 세션 토큰 사용
 * - 각 요청마다 새로운 클라이언트 인스턴스 생성 (서버 컴포넌트/액션에서 안전)
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = createClerkSupabaseClient();
 *   const { data } = await supabase.from('table').select('*');
 *   return <div>...</div>;
 * }
 * ```
 *
 * @example
 * ```ts
 * // Server Action
 * 'use server'
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export async function addTask(name: string) {
 *   const supabase = createClerkSupabaseClient();
 *   const { data, error } = await supabase.from('tasks').insert({ name });
 *   return { data, error };
 * }
 * ```
 */
export function createClerkSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      // auth()는 각 요청마다 새로운 인스턴스를 반환하므로 안전하게 사용 가능
      return (await auth()).getToken();
    },
  });
}
