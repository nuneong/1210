# Supabase 클라이언트 가이드

이 디렉토리에는 다양한 용도의 Supabase 클라이언트가 포함되어 있습니다.

## 클라이언트 종류

### 1. 표준 Supabase 클라이언트 (Supabase 자체 인증)

#### 서버 컴포넌트용
```typescript
// lib/supabase/server-standard.ts
import { createClient } from '@/lib/supabase/server-standard';

export default async function MyPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('table').select('*');
  return <div>...</div>;
}
```

**특징:**
- `@supabase/ssr` 패키지의 `createServerClient` 사용
- Next.js `cookies()`를 통한 세션 관리
- Supabase 자체 인증 시스템 사용

#### 클라이언트 컴포넌트용
```typescript
// lib/supabase/client-standard.ts
'use client';
import { createClient } from '@/lib/supabase/client-standard';

export default function MyComponent() {
  const supabase = createClient();
  // ...
}
```

**특징:**
- `@supabase/ssr` 패키지의 `createBrowserClient` 사용
- 브라우저에서 실행되는 클라이언트 컴포넌트용

### 2. Clerk 통합 클라이언트 (Clerk 인증 사용)

#### 서버 컴포넌트용
```typescript
// lib/supabase/server.ts
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = createClerkSupabaseClient();
  const { data } = await supabase.from('table').select('*');
  return <div>...</div>;
}
```

**특징:**
- Clerk 세션 토큰을 Supabase에 자동 전달
- `auth().getToken()`으로 Clerk 토큰 가져오기
- Clerk와 Supabase 네이티브 통합 사용

#### 클라이언트 컴포넌트용
```typescript
// lib/supabase/clerk-client.ts
'use client';
import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();
  // ...
}
```

**특징:**
- React Hook으로 제공
- `useSession()`으로 Clerk 세션 토큰 가져오기
- Clerk와 Supabase 네이티브 통합 사용

### 3. 관리자 클라이언트 (RLS 우회)

```typescript
// lib/supabase/service-role.ts
import { getServiceRoleClient } from '@/lib/supabase/service-role';

// 서버 사이드에서만 사용!
const supabase = getServiceRoleClient();
```

**특징:**
- RLS 정책을 우회하여 모든 데이터 접근 가능
- 서버 사이드에서만 사용해야 함
- 절대 클라이언트에 노출하지 마세요!

## 사용 가이드

### Supabase 자체 인증을 사용하는 경우

1. **서버 컴포넌트**: `lib/supabase/server-standard.ts`
2. **클라이언트 컴포넌트**: `lib/supabase/client-standard.ts`

### Clerk 인증을 사용하는 경우

1. **서버 컴포넌트**: `lib/supabase/server.ts` (createClerkSupabaseClient)
2. **클라이언트 컴포넌트**: `lib/supabase/clerk-client.ts` (useClerkSupabaseClient)

### 관리자 작업이 필요한 경우

- `lib/supabase/service-role.ts` (서버 사이드 전용)

## 참고 자료

- [Supabase 공식 Next.js 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Clerk Supabase 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase SSR 문서](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

