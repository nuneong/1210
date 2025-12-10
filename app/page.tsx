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
import { TourPageContent } from "@/components/tour-page-content";
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
 * 네이버 지도 영역 (플레이스홀더)
 * 향후 components/naver-map.tsx로 교체 예정
 */
function MapPlaceholder() {
  return (
    <div className="h-full min-h-[600px] lg:min-h-[600px] rounded-lg border bg-muted flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <p className="text-lg font-semibold mb-2">🗺️ 네이버 지도</p>
        <p className="text-sm">지도 영역 (구현 예정)</p>
      </div>
    </div>
  );
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
    <div className="space-y-6">
      {/* 데스크톱: 좌우 분할 레이아웃 */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {/* 좌측: 필터 및 관광지 목록 */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          <TourPageContent initialTours={tours} />
        </div>

        {/* 우측: 네이버 지도 */}
        <div className="sticky top-20">
          <MapPlaceholder />
        </div>
      </div>

      {/* 모바일/태블릿: 탭 전환 레이아웃 */}
      <div className="lg:hidden space-y-4">
        {/* 탭 헤더 (플레이스홀더) */}
        <div className="flex gap-2 border-b">
          <button className="px-4 py-2 font-medium border-b-2 border-primary">
            목록
          </button>
          <button className="px-4 py-2 font-medium text-muted-foreground">
            지도
          </button>
        </div>

        {/* 목록 뷰 */}
        <div>
          <TourPageContent initialTours={tours} />
        </div>

        {/* 지도 뷰 (숨김, 탭 전환으로 표시) */}
        <div className="hidden">
          <MapPlaceholder />
        </div>
      </div>
    </div>
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
