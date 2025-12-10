/**
 * Supabase 공식 문서 기반 예제 페이지
 * 
 * Supabase 공식 Next.js 퀵스타트 가이드를 따릅니다:
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * 
 * 이 페이지는 표준 Supabase 클라이언트를 사용하여 데이터를 조회합니다.
 * Clerk와 통합된 경우 `/tasks-example` 페이지를 참고하세요.
 */
import { createClient } from "@/lib/supabase/server-standard";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase.from("instruments").select();

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-800 mb-2">에러 발생</h3>
        <p className="text-sm text-red-700">{error.message}</p>
        <p className="text-xs text-red-600 mt-2">
          💡 <code>instruments</code> 테이블이 생성되지 않았을 수 있습니다.
          <br />
          Supabase SQL Editor에서 테이블을 생성하세요.
        </p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">데이터가 없습니다.</p>
        <p className="text-xs text-yellow-700 mt-2">
          Supabase SQL Editor에서 샘플 데이터를 추가하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">악기 목록</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {instruments.map((instrument: any) => (
          <div
            key={instrument.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg">{instrument.name}</h3>
            <p className="text-sm text-gray-500 mt-1">ID: {instrument.id}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
        <h3 className="font-semibold mb-2">원본 데이터 (JSON)</h3>
        <pre className="text-xs bg-white p-4 rounded border overflow-auto">
          {JSON.stringify(instruments, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function InstrumentsExample() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← 홈으로 돌아가기
        </Link>
        <h1 className="text-4xl font-bold mb-2">Supabase 표준 예제</h1>
        <p className="text-gray-600 mb-4">
          Supabase 공식 Next.js 퀵스타트 가이드를 기반으로 한 예제입니다.
        </p>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>📚 참고:</strong> 이 예제는{" "}
            <a
              href="https://supabase.com/docs/guides/getting-started/quickstarts/nextjs"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Supabase 공식 문서
            </a>
            를 따릅니다. <code>instruments</code> 테이블이 필요합니다.
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">악기 데이터를 불러오는 중...</p>
        </div>
      }>
        <InstrumentsData />
      </Suspense>

      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-bold mb-2 text-green-900">
          ✅ 이 예제의 작동 원리
        </h3>
        <ul className="text-sm text-green-900 space-y-1 list-disc list-inside">
          <li>
            <code>createClient</code> from <code>@/lib/supabase/server-standard</code>를 사용합니다
          </li>
          <li>
            <code>@supabase/ssr</code> 패키지의 <code>createServerClient</code>를 사용합니다
          </li>
          <li>
            Next.js의 <code>cookies()</code>를 통해 세션을 관리합니다
          </li>
          <li>
            Server Component에서 비동기로 데이터를 조회합니다
          </li>
        </ul>
      </div>
    </div>
  );
}

