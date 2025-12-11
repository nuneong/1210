/**
 * @file tour-page-content.tsx
 * @description 관광지 페이지 콘텐츠 컴포넌트 (클라이언트)
 *
 * 필터, 검색, 목록을 통합한 클라이언트 컴포넌트입니다.
 * 필터 상태에 따라 API를 재호출하고 목록을 업데이트합니다.
 *
 * @dependencies
 * - components/tour-filters.tsx: 필터 컴포넌트
 * - components/tour-list.tsx: 목록 컴포넌트
 * - lib/api/tour-api.ts: API 클라이언트
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getAreaBasedList,
  searchKeyword as searchKeywordApi,
  getDetailPetTour,
  extractItems,
} from "@/lib/api/tour-api";
import { TourFilters, type FilterState } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { TourList } from "@/components/tour-list";
import type { TourItem } from "@/lib/types/tour";
import type { ContentTypeId, PetTourInfo } from "@/lib/types/tour";

interface TourPageContentProps {
  /**
   * 초기 관광지 목록 (Server Component에서 페칭)
   */
  initialTours: TourItem[];
  /**
   * 선택된 관광지 ID
   */
  selectedTourId?: string | null;
  /**
   * 관광지 선택 콜백
   */
  onTourSelect?: (tourId: string) => void;
  /**
   * 관광지 목록 변경 콜백 (지도에 전달하기 위해)
   */
  onToursChange?: (tours: TourItem[]) => void;
}

/**
 * 관광지 목록을 정렬하는 함수
 */
function sortTours(tours: TourItem[], sort: FilterState["sort"]): TourItem[] {
  const sorted = [...tours];
  switch (sort) {
    case "name":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    case "latest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.modifiedtime).getTime() -
          new Date(a.modifiedtime).getTime()
      );
  }
}

/**
 * 반려동물 정보 캐시 (성능 최적화)
 */
const petInfoCache = new Map<string, PetTourInfo | null>();

/**
 * 반려동물 정보 조회 (병렬 처리)
 */
async function fetchPetInfos(
  items: TourItem[]
): Promise<Map<string, PetTourInfo | null>> {
  const petInfoMap = new Map<string, PetTourInfo | null>();

  // 캐시에 있는 항목은 제외
  const itemsToFetch = items.filter(
    (item) => !petInfoCache.has(item.contentid)
  );

  if (itemsToFetch.length === 0) {
    // 모든 항목이 캐시에 있으면 캐시에서 반환
    items.forEach((item) => {
      const cached = petInfoCache.get(item.contentid);
      if (cached !== undefined) {
        petInfoMap.set(item.contentid, cached);
      }
    });
    return petInfoMap;
  }

  // 병렬로 반려동물 정보 조회 (최대 20개)
  const fetchPromises = itemsToFetch.slice(0, 20).map(async (item) => {
    try {
      const response = await getDetailPetTour({ contentId: item.contentid });
      const petInfo = extractItems(response)[0] || null;
      petInfoCache.set(item.contentid, petInfo);
      return { contentId: item.contentid, petInfo };
    } catch (error) {
      console.error(
        `반려동물 정보 조회 실패 (${item.contentid}):`,
        error
      );
      petInfoCache.set(item.contentid, null);
      return { contentId: item.contentid, petInfo: null };
    }
  });

  const results = await Promise.all(fetchPromises);
  results.forEach(({ contentId, petInfo }) => {
    petInfoMap.set(contentId, petInfo);
  });

  // 캐시에 있는 항목도 추가
  items.forEach((item) => {
    if (!petInfoMap.has(item.contentid)) {
      const cached = petInfoCache.get(item.contentid);
      if (cached !== undefined) {
        petInfoMap.set(item.contentid, cached);
      }
    }
  });

  return petInfoMap;
}

/**
 * 반려동물 필터링 함수
 */
function filterByPet(
  items: TourItem[],
  petInfoMap: Map<string, PetTourInfo | null>,
  petFriendly: boolean,
  petSizes?: string[]
): TourItem[] {
  if (!petFriendly) {
    return items;
  }

  return items.filter((item) => {
    const petInfo = petInfoMap.get(item.contentid);
    if (!petInfo) {
      return false; // 반려동물 정보가 없으면 제외
    }

    // 반려동물 동반 가능 여부 확인
    const isPetFriendly =
      petInfo.chkpetleash === "가능" ||
      petInfo.chkpetleash === "Y" ||
      petInfo.chkpetleash === "yes";

    if (!isPetFriendly) {
      return false;
    }

    // 크기 필터가 있으면 확인
    if (petSizes && petSizes.length > 0) {
      const petSize = petInfo.chkpetsize || "";
      const matchesSize = petSizes.some((size) =>
        petSize.includes(size)
      );
      return matchesSize;
    }

    return true;
  });
}

/**
 * 관광지 페이지 콘텐츠 컴포넌트
 */
export function TourPageContent({ 
  initialTours,
  selectedTourId,
  onTourSelect,
  onToursChange,
}: TourPageContentProps) {
  const [filters, setFilters] = useState<FilterState>({
    areaCode: "1", // 서울 (기본값)
    contentTypeIds: [],
    sort: "latest",
  });

  const [searchKeyword, setSearchKeyword] = useState("");
  const [tours, setTours] = useState<TourItem[]>(initialTours);

  // 초기 렌더링 시 onToursChange 호출 보장
  useEffect(() => {
    if (onToursChange && initialTours.length > 0) {
      console.log("[TourPageContent] 초기 tours 전달:", initialTours.length);
      onToursChange(initialTours);
    }
  }, []); // 초기 마운트 시에만 실행
  const [petInfoMap, setPetInfoMap] = useState<
    Map<string, PetTourInfo | null>
  >(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPetInfo, setIsLoadingPetInfo] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 필터 또는 검색어 변경 시 API 재호출
  useEffect(() => {
    const fetchTours = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let items: TourItem[] = [];

        // 검색어가 있으면 검색 API 사용
        if (searchKeyword.trim()) {
          const searchParams: Parameters<typeof searchKeywordApi>[0] = {
            keyword: searchKeyword.trim(),
            numOfRows: 20,
            pageNo: 1,
          };

          // 지역 필터 적용
          if (filters.areaCode) {
            searchParams.areaCode = filters.areaCode;
          }

          // 관광 타입 필터 적용
          if (filters.contentTypeIds.length > 0) {
            searchParams.contentTypeId = filters.contentTypeIds[0];
          }

          const searchResponse = await searchKeywordApi(searchParams);
          items = extractItems(searchResponse);
        } else {
          // 검색어가 없으면 지역 기반 목록 API 사용
          const params: Parameters<typeof getAreaBasedList>[0] = {
            areaCode: filters.areaCode || "1",
            numOfRows: 20,
            pageNo: 1,
          };

          // 관광 타입 필터 적용
          if (filters.contentTypeIds.length > 0) {
            params.contentTypeId = filters.contentTypeIds[0];
          }

          const response = await getAreaBasedList(params);
          items = extractItems(response);
        }

        // 관광 타입 필터링 (클라이언트 사이드, 다중 선택 지원)
        let filteredItems = items;
        if (filters.contentTypeIds.length > 0) {
          filteredItems = items.filter((item) =>
            filters.contentTypeIds.includes(
              item.contenttypeid as ContentTypeId
            )
          );
        }

        // 반려동물 필터링 (필터가 활성화되어 있을 때만)
        if (filters.petFriendly) {
          setIsLoadingPetInfo(true);
          try {
            const petInfos = await fetchPetInfos(filteredItems);
            setPetInfoMap(petInfos);
            filteredItems = filterByPet(
              filteredItems,
              petInfos,
              filters.petFriendly,
              filters.petSizes
            );
          } catch (err) {
            console.error("반려동물 정보 조회 실패:", err);
            // 에러가 발생해도 계속 진행 (필터링만 스킵)
          } finally {
            setIsLoadingPetInfo(false);
          }
        } else {
          // 반려동물 필터가 비활성화되면 petInfoMap 초기화
          setPetInfoMap(new Map());
        }

        // 정렬 적용
        const sortedItems = sortTours(filteredItems, filters.sort);
        setTours(sortedItems);
        
        // 부모 컴포넌트에 tours 변경 알림
        if (onToursChange) {
          onToursChange(sortedItems);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("관광지 목록을 불러올 수 없습니다.");
        setError(error);
        console.error("관광지 목록 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
  }, [filters, searchKeyword]);

  return (
    <div className="space-y-6">
      {/* 검색 영역 */}
      <div className="rounded-lg border bg-card p-4">
        <TourSearch
          keyword={searchKeyword}
          onSearch={setSearchKeyword}
          isLoading={isLoading}
        />
      </div>

      {/* 필터 영역 */}
      <TourFilters filters={filters} onFiltersChange={setFilters} />

      {/* 목록 영역 */}
      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      ) : (
        <TourList
          tours={tours}
          isLoading={isLoading || isLoadingPetInfo}
          selectedTourId={selectedTourId}
          onTourSelect={onTourSelect}
        />
      )}
    </div>
  );
}

