/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 목록에서 각 관광지를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 썸네일 이미지 표시 (기본 이미지 fallback)
 * 2. 관광지명, 주소, 타입 뱃지 표시
 * 3. 호버 효과 (scale, shadow)
 * 4. 클릭 시 상세페이지 이동
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - next/link: 클라이언트 사이드 네비게이션
 * - lib/types/tour.ts: TourItem 타입
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { CONTENT_TYPE_NAMES } from "@/lib/types/tour";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourCardProps {
  /**
   * 관광지 데이터
   */
  tour: TourItem;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 선택된 상태인지 여부
   */
  isSelected?: boolean;
  /**
   * 카드 클릭 시 호출되는 콜백 (상세페이지 이동 전에 호출)
   */
  onSelect?: (tourId: string) => void;
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 */
const DEFAULT_IMAGE = "/logo.png";

/**
 * 관광지 카드 컴포넌트
 */
export function TourCard({ 
  tour, 
  className, 
  isSelected = false,
  onSelect 
}: TourCardProps) {
  const imageUrl = tour.firstimage || tour.firstimage2 || DEFAULT_IMAGE;
  const contentTypeName =
    CONTENT_TYPE_NAMES[tour.contenttypeid as keyof typeof CONTENT_TYPE_NAMES] ||
    "관광지";
  const detailUrl = `/places/${tour.contentid}`;

  const handleClick = () => {
    if (onSelect) {
      onSelect(tour.contentid);
    }
  };

  return (
    <Link href={detailUrl} onClick={handleClick}>
      <div
        className={cn(
          "group relative rounded-lg border bg-card shadow-sm transition-all duration-200",
          "hover:scale-[1.02] hover:shadow-md",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "overflow-hidden",
          isSelected && "ring-2 ring-primary ring-offset-2",
          className
        )}
        role="article"
        aria-label={`${tour.title} 관광지 카드`}
        aria-selected={isSelected}
      >
        {/* 썸네일 이미지 */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={tour.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              // 이미지 로드 실패 시 기본 이미지로 대체
              const target = e.target as HTMLImageElement;
              if (target.src !== DEFAULT_IMAGE) {
                target.src = DEFAULT_IMAGE;
              }
            }}
          />
          {/* 관광 타입 뱃지 (이미지 위 오버레이) */}
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
              {contentTypeName}
            </span>
          </div>
        </div>

        {/* 카드 내용 */}
        <div className="p-4 space-y-2">
          {/* 관광지명 */}
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {tour.title}
          </h3>

          {/* 주소 */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground line-clamp-1">
              {tour.addr1}
            </p>
            {tour.addr2 && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {tour.addr2}
              </p>
            )}
          </div>

          {/* 전화번호 (있는 경우) */}
          {tour.tel && (
            <p className="text-xs text-muted-foreground truncate">
              📞 {tour.tel}
            </p>
          )}

          {/* 카테고리 정보 (있는 경우) */}
          {(tour.cat1 || tour.cat2 || tour.cat3) && (
            <div className="flex flex-wrap gap-1 pt-1">
              {tour.cat1 && (
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {tour.cat1}
                </span>
              )}
              {tour.cat2 && (
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {tour.cat2}
                </span>
              )}
              {tour.cat3 && (
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {tour.cat3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

