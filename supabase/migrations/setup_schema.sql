-- Users 테이블 생성
-- Clerk 인증과 연동되는 사용자 정보를 저장하는 테이블
-- 2025년 모범 사례: Clerk user_id를 TEXT로 저장하고 RLS 정책으로 보호

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.users OWNER TO postgres;

-- Row Level Security (RLS) 활성화
-- Clerk와 Supabase 네이티브 통합에서는 RLS를 활성화하여 보안을 강화합니다
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- RLS 정책 생성
-- Clerk의 JWT에서 'sub' 클레임을 사용하여 사용자 ID를 추출합니다
-- auth.jwt()->>'sub'는 Clerk의 사용자 ID를 반환합니다

-- 사용자는 자신의 데이터만 조회할 수 있습니다
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = clerk_id
);

-- 사용자는 자신의 데이터만 삽입할 수 있습니다
CREATE POLICY "Users can insert their own data"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = clerk_id
);

-- 사용자는 자신의 데이터만 업데이트할 수 있습니다
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = clerk_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = clerk_id
);

-- 사용자는 자신의 데이터만 삭제할 수 있습니다
CREATE POLICY "Users can delete their own data"
ON public.users
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = clerk_id
);
