/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록 및 지도 통합 페이지
 *
 * 이 페이지는 관광지 목록, 필터, 검색, 지도 기능을 통합한 메인 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 목록 표시 (그리드 레이아웃)
 * 2. 지역/타입 필터
 * 3. 키워드 검색
 * 4. 네이버 지도 연동 (데스크톱: 분할, 모바일: 탭)
 *
 * 핵심 구현 로직:
 * - Server Component에서 초기 데이터 페칭
 * - 반응형 레이아웃 (데스크톱: 좌우 분할, 모바일: 탭 전환)
 * - URL 쿼리 파라미터 기반 필터 상태 관리
 *
 * @dependencies
 * - lib/api/tour-api.ts: 관광지 API 클라이언트
 * - lib/types/tour.ts: 타입 정의
 * - components/ui/error.tsx: 에러 처리
 * - components/ui/skeleton.tsx: 로딩 상태
 */

import { Suspense } from "react";
import { getAreaBasedList, extractItems } from "@/lib/api/tour-api";
import { ErrorMessage } from "@/components/ui/error";
import { HomeMapView } from "@/components/home-map-view";
import type { TourItem } from "@/lib/types/tour";

/**
 * 초기 관광지 데이터 페칭
 * 기본값: 서울 지역, 전체 타입, 첫 페이지
 */
async function getInitialTours(): Promise<TourItem[]> {
  try {
    const response = await getAreaBasedList({
      areaCode: "1", // 서울 (기본값)
      numOfRows: 20,
      pageNo: 1,
    });
    return extractItems(response);
  } catch (error) {
    console.error("관광지 목록 조회 실패:", error);
    throw error;
  }
}




/**
 * 로딩 상태 컴포넌트
 */
function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

/**
 * 메인 콘텐츠 영역 (Server Component)
 */
async function HomeContent() {
  let tours: TourItem[] = [];
  let error: Error | null = null;

  try {
    tours = await getInitialTours();
  } catch (err) {
    error = err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다.");
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage
          title="관광지 목록을 불러올 수 없습니다"
          message={error.message}
          variant="error"
        />
      </div>
    );
  }

  return (
    <HomeMapView initialTours={tours} initialAreaCode="1" />
  );
}

/**
 * 홈페이지 메인 컴포넌트
 */
export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">전국 관광지 탐색</h1>
          <p className="text-muted-foreground">
            한국관광공사 데이터를 활용한 관광지 정보 서비스
          </p>
        </div>

        {/* 메인 콘텐츠 */}
        <Suspense fallback={<LoadingState />}>
          <HomeContent />
        </Suspense>
      </div>
    </div>
  );
}
