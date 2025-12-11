/**
 * @file loading.tsx
 * @description 상세페이지 로딩 상태 컴포넌트
 *
 * 관광지 상세페이지 로딩 중 표시되는 스켈레톤 UI입니다.
 *
 * @dependencies
 * - components/ui/skeleton.tsx: 스켈레톤 UI 컴포넌트
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 상세페이지 로딩 상태 컴포넌트
 */
export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 space-y-8">
        {/* 뒤로가기 버튼 스켈레톤 */}
        <Skeleton className="h-10 w-32" />

        {/* 기본 정보 섹션 스켈레톤 */}
        <section className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </section>

        {/* 운영 정보 섹션 스켈레톤 */}
        <section className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </section>
      </div>
    </div>
  );
}

