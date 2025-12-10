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
 *
 * @dependencies
 * - components/tour-card.tsx: 관광지 카드 컴포넌트
 * - components/ui/skeleton.tsx: 로딩 스켈레톤
 * - lib/types/tour.ts: TourItem 타입
 */

"use client";

import { TourCard } from "@/components/tour-card";
import { SkeletonList } from "@/components/ui/skeleton";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface TourListProps {
  /**
   * 관광지 목록
   */
  tours: TourItem[];
  /**
   * 로딩 상태
   */
  isLoading?: boolean;
  /**
   * 추가 클래스명
   */
  className?: string;
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
 * 관광지 목록 컴포넌트
 */
export function TourList({
  tours,
  isLoading = false,
  className,
}: TourListProps) {
  // 로딩 상태
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
          <TourCard key={tour.contentid} tour={tour} />
        ))}
      </div>
    </div>
  );
}

