/**
 * @file tour-page-content.tsx
 * @description 관광지 페이지 콘텐츠 컴포넌트 (클라이언트)
 *
 * 필터, 검색, 목록을 통합한 클라이언트 컴포넌트입니다.
 * 필터 상태에 따라 API를 재호출하고 목록을 업데이트합니다.
 * 무한 스크롤을 통한 페이지네이션을 지원합니다.
 *
 * @dependencies
 * - components/tour-filters.tsx: 필터 컴포넌트
 * - components/tour-list.tsx: 목록 컴포넌트
 * - lib/api/tour-api.ts: API 클라이언트
 * - lib/constants/pagination.ts: 페이지네이션 상수
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getAreaBasedList,
  searchKeyword as searchKeywordApi,
  getDetailPetTour,
  extractItems,
} from "@/lib/api/tour-api";
import { TourFilters, type FilterState } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { TourList } from "@/components/tour-list";
import { PAGE_SIZE } from "@/lib/constants/pagination";
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

  // 페이지네이션 상태
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // tours 변경 시 부모 컴포넌트에 알림 (렌더링 후 실행)
  useEffect(() => {
    if (onToursChangeRef.current && tours.length > 0) {
      console.log("[TourPageContent] tours 변경 알림:", tours.length);
      onToursChangeRef.current(tours);
    }
  }, [tours]);

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

  // 중복 API 호출 방지를 위한 ref
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);
  const onToursChangeRef = useRef(onToursChange);
  
  // onToursChange ref 업데이트
  useEffect(() => {
    onToursChangeRef.current = onToursChange;
  }, [onToursChange]);

  /**
   * 관광지 목록 조회 (공통 로직)
   */
  const fetchToursPage = useCallback(async (
    page: number,
    isLoadMore: boolean = false
  ): Promise<TourItem[]> => {
    let items: TourItem[] = [];

    // 검색어가 있으면 검색 API 사용
    if (searchKeyword.trim()) {
      const searchParams: Parameters<typeof searchKeywordApi>[0] = {
        keyword: searchKeyword.trim(),
        numOfRows: PAGE_SIZE,
        pageNo: page,
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
        numOfRows: PAGE_SIZE,
        pageNo: page,
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
    if (filters.petFriendly && !isLoadMore) {
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
    } else if (!isLoadMore) {
      // 반려동물 필터가 비활성화되면 petInfoMap 초기화
      setPetInfoMap(new Map());
    }

    return filteredItems;
  }, [filters, searchKeyword]);

  // 필터 또는 검색어 변경 시 API 재호출 (첫 페이지)
  useEffect(() => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const fetchTours = async () => {
      // 중복 호출 방지
      if (isLoadingRef.current) {
        console.log("[TourPageContent] 이미 로딩 중, 스킵");
        return;
      }
      
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);
      // 페이지 초기화
      setPageNo(1);
      setHasMore(true);

      try {
        const items = await fetchToursPage(1, false);

        // 정렬 적용
        const sortedItems = sortTours(items, filters.sort);
        setTours(sortedItems);

        // 더 이상 데이터가 없는지 확인
        if (items.length < PAGE_SIZE) {
          setHasMore(false);
        }

        console.log(`[TourPageContent] 첫 페이지 로드 완료: ${sortedItems.length}개`);
      } catch (err) {
        // 취소된 요청은 에러로 처리하지 않음
        if (err instanceof Error && err.name === "AbortError") {
          console.log("[TourPageContent] 요청 취소됨");
          return;
        }
        
        const error =
          err instanceof Error ? err : new Error("관광지 목록을 불러올 수 없습니다.");
        setError(error);
        console.error("관광지 목록 조회 실패:", error);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    };

    fetchTours();
    
    // Cleanup: 컴포넌트 언마운트 또는 의존성 변경 시 요청 취소
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters.areaCode, filters.contentTypeIds, filters.petFriendly, filters.petSizes, filters.sort, searchKeyword, fetchToursPage]);

  /**
   * 추가 데이터 로드 (무한 스크롤)
   */
  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) {
      console.log("[TourPageContent] loadMore 스킵:", { isLoading, isLoadingMore, hasMore });
      return;
    }

    setIsLoadingMore(true);
    const nextPage = pageNo + 1;

    try {
      console.log(`[TourPageContent] 추가 페이지 로드 시작: ${nextPage}페이지`);
      const newItems = await fetchToursPage(nextPage, true);

      // 정렬 적용
      const sortedNewItems = sortTours(newItems, filters.sort);

      // 기존 데이터에 추가
      setTours((prev) => {
        return [...prev, ...sortedNewItems];
      });

      setPageNo(nextPage);

      // 더 이상 데이터가 없는지 확인
      if (newItems.length < PAGE_SIZE) {
        setHasMore(false);
        console.log("[TourPageContent] 마지막 페이지 도달");
      }

      console.log(`[TourPageContent] 추가 페이지 로드 완료: ${sortedNewItems.length}개 추가`);
    } catch (err) {
      console.error("추가 데이터 로드 실패:", err);
      // 에러 시에도 hasMore는 유지 (재시도 가능)
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, pageNo, fetchToursPage, filters.sort]);

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
          <button
            onClick={() => {
              setError(null);
              setPageNo(1);
              setHasMore(true);
            }}
            className="mt-2 text-sm text-primary hover:underline"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <TourList
          tours={tours}
          isLoading={isLoading || isLoadingPetInfo}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          selectedTourId={selectedTourId}
          onTourSelect={onTourSelect}
        />
      )}
    </div>
  );
}

