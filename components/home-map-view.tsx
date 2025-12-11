/**
 * @file home-map-view.tsx
 * @description 홈페이지 지도 뷰 컴포넌트 (클라이언트)
 *
 * 홈페이지에서 지도와 목록을 통합하여 표시하는 클라이언트 컴포넌트입니다.
 * 데스크톱에서는 좌우 분할 레이아웃, 모바일에서는 탭 전환 레이아웃을 제공합니다.
 *
 * 주요 기능:
 * 1. 데스크톱: 좌측 목록 + 우측 지도 분할 레이아웃
 * 2. 모바일: 목록/지도 탭 전환
 * 3. 리스트-지도 양방향 연동
 *
 * @dependencies
 * - components/naver-map.tsx: 네이버 지도 컴포넌트
 * - components/tour-page-content.tsx: 관광지 페이지 콘텐츠
 * - lib/types/tour.ts: TourItem 타입
 */

"use client";

import { useState, useEffect } from "react";
import { NaverMap } from "@/components/naver-map";
import { TourPageContent } from "@/components/tour-page-content";
import type { TourItem } from "@/lib/types/tour";

interface HomeMapViewProps {
  /**
   * 초기 관광지 목록
   */
  initialTours: TourItem[];
  /**
   * 초기 지역 코드
   */
  initialAreaCode?: string;
}

/**
 * 홈페이지 지도 뷰 컴포넌트
 */
export function HomeMapView({ initialTours, initialAreaCode }: HomeMapViewProps) {
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [currentTours, setCurrentTours] = useState<TourItem[]>(initialTours);
  const [currentAreaCode, setCurrentAreaCode] = useState<string | null>(
    initialAreaCode || "1"
  );

  const handleTourSelect = (tourId: string) => {
    setSelectedTourId(tourId);
  };

  const handleToursChange = (tours: TourItem[]) => {
    console.log("[HomeMapView] tours 변경:", tours.length);
    setCurrentTours(tours);
  };

  // initialTours 변경 시 currentTours 동기화
  useEffect(() => {
    console.log("[HomeMapView] initialTours 변경:", initialTours.length);
    setCurrentTours(initialTours);
  }, [initialTours]);

  return (
    <div className="space-y-6">
      {/* 데스크톱: 좌우 분할 레이아웃 */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {/* 좌측: 필터 및 관광지 목록 */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          <TourPageContent
            initialTours={initialTours}
            selectedTourId={selectedTourId}
            onTourSelect={handleTourSelect}
            onToursChange={handleToursChange}
          />
        </div>

        {/* 우측: 네이버 지도 */}
        <div className="sticky top-20">
          <NaverMap
            tours={currentTours}
            selectedTourId={selectedTourId}
            onTourSelect={handleTourSelect}
            areaCode={currentAreaCode}
          />
        </div>
      </div>

      {/* 모바일/태블릿: 탭 전환 레이아웃 */}
      <div className="lg:hidden space-y-4">
        {/* 탭 헤더 */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("list")}
            className={`
              px-4 py-2 font-medium transition-colors
              ${
                activeTab === "list"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
            aria-label="목록 탭"
            aria-selected={activeTab === "list"}
          >
            목록
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`
              px-4 py-2 font-medium transition-colors
              ${
                activeTab === "map"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
            aria-label="지도 탭"
            aria-selected={activeTab === "map"}
          >
            지도
          </button>
        </div>

        {/* 목록 뷰 */}
        {activeTab === "list" && (
          <div>
            <TourPageContent
              initialTours={initialTours}
              selectedTourId={selectedTourId}
              onTourSelect={handleTourSelect}
              onToursChange={handleToursChange}
            />
          </div>
        )}

        {/* 지도 뷰 */}
        {activeTab === "map" && (
          <div>
            <NaverMap
              tours={currentTours}
              selectedTourId={selectedTourId}
              onTourSelect={(tourId) => {
                handleTourSelect(tourId);
                setActiveTab("list"); // 지도에서 선택 시 목록 탭으로 전환
              }}
              areaCode={currentAreaCode}
            />
          </div>
        )}
      </div>
    </div>
  );
}

