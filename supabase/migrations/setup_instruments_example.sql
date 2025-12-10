-- Instruments 테이블 예제
-- Supabase 공식 Next.js 퀵스타트 가이드 기반:
-- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
-- 
-- 이 파일은 `/instruments-example` 페이지에서 사용됩니다.

-- Instruments 테이블 생성
CREATE TABLE IF NOT EXISTS public.instruments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.instruments OWNER TO postgres;

-- Row Level Security (RLS) 활성화
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.instruments TO anon;
GRANT ALL ON TABLE public.instruments TO authenticated;
GRANT ALL ON TABLE public.instruments TO service_role;

-- 공개 읽기 정책 (anon 사용자도 읽을 수 있음)
-- Supabase 공식 문서의 예제를 따릅니다
CREATE POLICY "public can read instruments"
ON public.instruments
FOR SELECT
TO anon
USING (true);

-- 인증된 사용자도 읽을 수 있음
CREATE POLICY "authenticated can read instruments"
ON public.instruments
FOR SELECT
TO authenticated
USING (true);

-- 샘플 데이터 삽입
INSERT INTO public.instruments (name)
VALUES
    ('violin'),
    ('viola'),
    ('cello')
ON CONFLICT DO NOTHING;

