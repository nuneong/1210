/**
 * Supabase 표준 서버 클라이언트 (Supabase 자체 인증용)
 * 
 * Supabase 공식 Next.js 가이드에 따른 표준 구현:
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * 
 * 이 클라이언트는 Supabase 자체 인증을 사용하는 경우에 사용합니다.
 * Clerk와 통합된 경우에는 `createClerkSupabaseClient`를 사용하세요.
 * 
 * @example
 * ```tsx
 * // Server Component
 * import { createClient } from '@/lib/supabase/server-standard';
 * 
 * export default async function MyPage() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('table').select('*');
 *   return <div>...</div>;
 * }
 * ```
 * 
 * @example
 * ```ts
 * // Server Action
 * 'use server'
 * import { createClient } from '@/lib/supabase/server-standard';
 * 
 * export async function addItem(name: string) {
 *   const supabase = await createClient();
 *   const { data, error } = await supabase.from('items').insert({ name });
 *   return { data, error };
 * }
 * ```
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

