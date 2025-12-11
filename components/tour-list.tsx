/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 반응형 그리드 레이아웃 (모바일: 1열, 태블릿: 2열, 데스크톱: 3열)
 * 2. 관광지 카드 목록 표시
 * 3. 로딩 상태 (Skeleton UI)
 * 4. 빈 상태 처리
 * 5. 무한 스크롤 (Intersection Observer)
 *
 * @dependencies
 * - components/tour-card.tsx: 관광지 카드 컴포넌트
 * - components/ui/skeleton.tsx: 로딩 스켈레톤
 * - hooks/use-intersection-observer.ts: Intersection Observer 훅
 * - lib/types/tour.ts: TourItem 타입
 */

"use client";

import { TourCard } from "@/components/tour-card";
import { SkeletonList } from "@/components/ui/skeleton";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";
import { MapPin, Loader2 } from "lucide-react";

interface TourListProps {
  /**
   * 관광지 목록
   */
  tours: TourItem[];
  /**
   * 초기 로딩 상태
   */
  isLoading?: boolean;
  /**
   * 추가 데이터 로딩 상태 (무한 스크롤)
   */
  isLoadingMore?: boolean;
  /**
   * 더 많은 데이터가 있는지 여부
   */
  hasMore?: boolean;
  /**
   * 추가 데이터 로드 콜백 (무한 스크롤)
   */
  onLoadMore?: () => void;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 선택된 관광지 ID
   */
  selectedTourId?: string | null;
  /**
   * 관광지 선택 콜백
   */
  onTourSelect?: (tourId: string) => void;
}

/**
 * 빈 상태 컴포넌트
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <MapPin className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">관광지를 찾을 수 없습니다</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        검색 조건을 변경하거나 다른 필터를 시도해보세요.
      </p>
    </div>
  );
}

/**
 * 로딩 스피너 컴포넌트
 */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">로딩 중...</span>
    </div>
  );
}

/**
 * 목록 끝 메시지 컴포넌트
 */
function EndOfListMessage() {
  return (
    <div className="flex items-center justify-center py-8">
      <p className="text-sm text-muted-foreground">
        더 이상 표시할 관광지가 없습니다
      </p>
    </div>
  );
}

/**
 * 관광지 목록 컴포넌트
 */
export function TourList({
  tours,
  isLoading = false,
  isLoadingMore = false,
  hasMore = true,
  onLoadMore,
  className,
  selectedTourId,
  onTourSelect,
}: TourListProps) {
  // Intersection Observer로 무한 스크롤 구현
  const observerRef = useIntersectionObserver({
    onIntersect: () => {
      if (onLoadMore) {
        onLoadMore();
      }
    },
    enabled: hasMore && !isLoading && !isLoadingMore && tours.length > 0,
    rootMargin: "100px", // 100px 전에 미리 로드
  });

  // 초기 로딩 상태
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <SkeletonList count={6} />
      </div>
    );
  }

  // 빈 상태
  if (tours.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <EmptyState />
      </div>
    );
  }

  // 목록 표시
  return (
    <div className={cn("space-y-4", className)}>
      {/* 결과 개수 표시 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{tours.length}</span>
          개의 관광지가 있습니다
        </p>
      </div>

      {/* 그리드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tours.map((tour) => (
          <TourCard
            key={tour.contentid}
            tour={tour}
            isSelected={tour.contentid === selectedTourId}
            onSelect={onTourSelect}
          />
        ))}
      </div>

      {/* 무한 스크롤 감지 요소 */}
      <div ref={observerRef} className="h-4" aria-hidden="true" />

      {/* 추가 로딩 인디케이터 */}
      {isLoadingMore && <LoadingSpinner />}

      {/* 더 이상 데이터가 없을 때 메시지 */}
      {!hasMore && tours.length > 0 && <EndOfListMessage />}
    </div>
  );
}

