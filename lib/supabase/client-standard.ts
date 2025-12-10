/**
 * Supabase 표준 브라우저 클라이언트 (Supabase 자체 인증용)
 * 
 * Supabase 공식 Next.js 가이드에 따른 표준 구현:
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * 
 * 이 클라이언트는 Client Component에서 Supabase 자체 인증을 사용하는 경우에 사용합니다.
 * Clerk와 통합된 경우에는 `useClerkSupabaseClient`를 사용하세요.
 * 
 * @example
 * ```tsx
 * 'use client';
 * 
 * import { createClient } from '@/lib/supabase/client-standard';
 * 
 * export default function MyComponent() {
 *   const supabase = createClient();
 * 
 *   async function fetchData() {
 *     const { data } = await supabase.from('table').select('*');
 *     return data;
 *   }
 * 
 *   return <div>...</div>;
 * }
 * ```
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

