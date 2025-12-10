-- Tasks 테이블 예제
-- Clerk 공식 문서의 예제를 기반으로 한 RLS 정책 예제
-- 이 파일은 참고용이며, 필요에 따라 수정하여 사용하세요

-- Tasks 테이블 생성
-- user_id는 Clerk의 사용자 ID를 저장하며, 기본값으로 auth.jwt()->>'sub'를 사용합니다
CREATE TABLE IF NOT EXISTS public.tasks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT (SELECT auth.jwt()->>'sub'),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.tasks OWNER TO postgres;

-- Row Level Security (RLS) 활성화
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.tasks TO anon;
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.tasks TO service_role;

-- RLS 정책 생성
-- Clerk 공식 문서의 모범 사례를 따릅니다

-- 사용자는 자신의 작업만 조회할 수 있습니다
CREATE POLICY "User can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = user_id)::text
);

-- 사용자는 자신의 작업만 삽입할 수 있습니다
CREATE POLICY "Users must insert their own tasks"
ON public.tasks
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  ((SELECT auth.jwt()->>'sub') = user_id)::text
);

-- 사용자는 자신의 작업만 업데이트할 수 있습니다
CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = user_id)::text
)
WITH CHECK (
  ((SELECT auth.jwt()->>'sub') = user_id)::text
);

-- 사용자는 자신의 작업만 삭제할 수 있습니다
CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = user_id)::text
);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

