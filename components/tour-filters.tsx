/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 정렬 옵션을 선택할 수 있는 필터 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 선택)
 * 2. 관광 타입 필터 (다중 선택 가능)
 * 3. 정렬 옵션 (최신순, 이름순)
 *
 * @dependencies
 * - components/ui/button.tsx: 버튼 컴포넌트
 * - lib/types/tour.ts: 타입 정의
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CONTENT_TYPE_IDS,
  CONTENT_TYPE_NAMES,
  type ContentTypeId,
} from "@/lib/types/tour";
import { getAreaCode, extractItems } from "@/lib/api/tour-api";
import type { AreaCodeItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";

export type SortOption = "latest" | "name";

export interface FilterState {
  /**
   * 선택된 지역 코드 (전체: null)
   */
  areaCode: string | null;
  /**
   * 선택된 관광 타입 ID 배열 (전체: [])
   */
  contentTypeIds: ContentTypeId[];
  /**
   * 정렬 옵션
   */
  sort: SortOption;
  /**
   * 반려동물 동반 가능 필터 (활성화 여부)
   */
  petFriendly?: boolean;
  /**
   * 반려동물 크기 필터 (소형, 중형, 대형)
   */
  petSizes?: string[];
}

interface TourFiltersProps {
  /**
   * 현재 필터 상태
   */
  filters: FilterState;
  /**
   * 필터 변경 핸들러
   */
  onFiltersChange: (filters: FilterState) => void;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 지역 코드 목록 (기본값, API로 대체 예정)
 */
const DEFAULT_AREA_CODES: Array<{ code: string; name: string }> = [
  { code: "1", name: "서울" },
  { code: "2", name: "인천" },
  { code: "3", name: "대전" },
  { code: "4", name: "대구" },
  { code: "5", name: "광주" },
  { code: "6", name: "부산" },
  { code: "7", name: "울산" },
  { code: "8", name: "세종" },
  { code: "31", name: "경기" },
  { code: "32", name: "강원" },
  { code: "33", name: "충북" },
  { code: "34", name: "충남" },
  { code: "35", name: "경북" },
  { code: "36", name: "경남" },
  { code: "37", name: "전북" },
  { code: "38", name: "전남" },
  { code: "39", name: "제주" },
];

/**
 * 관광 타입 필터 컴포넌트
 */
function ContentTypeFilter({
  selectedTypes,
  onTypesChange,
}: {
  selectedTypes: ContentTypeId[];
  onTypesChange: (types: ContentTypeId[]) => void;
}) {
  const toggleType = (typeId: ContentTypeId) => {
    if (selectedTypes.includes(typeId)) {
      onTypesChange(selectedTypes.filter((id) => id !== typeId));
    } else {
      onTypesChange([...selectedTypes, typeId]);
    }
  };

  const selectAll = () => {
    onTypesChange([]);
  };

  const allSelected = selectedTypes.length === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">관광 타입</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={selectAll}
          className="h-7 text-xs"
        >
          {allSelected ? "선택 해제" : "전체"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(CONTENT_TYPE_IDS).map(([key, typeId]) => (
          <Button
            key={typeId}
            variant={selectedTypes.includes(typeId) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleType(typeId)}
            className="h-8 text-xs"
          >
            {CONTENT_TYPE_NAMES[typeId]}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * 지역 필터 컴포넌트
 */
function AreaFilter({
  selectedArea,
  onAreaChange,
  areaCodes,
}: {
  selectedArea: string | null;
  onAreaChange: (areaCode: string | null) => void;
  areaCodes: Array<{ code: string; name: string }>;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">지역</label>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedArea === null ? "default" : "outline"}
          size="sm"
          onClick={() => onAreaChange(null)}
          className="h-8 text-xs"
        >
          전체
        </Button>
        {areaCodes.map((area) => (
          <Button
            key={area.code}
            variant={selectedArea === area.code ? "default" : "outline"}
            size="sm"
            onClick={() => onAreaChange(area.code)}
            className="h-8 text-xs"
          >
            {area.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * 반려동물 필터 컴포넌트
 */
function PetFilter({
  petFriendly,
  petSizes,
  onPetFriendlyChange,
  onPetSizesChange,
}: {
  petFriendly?: boolean;
  petSizes?: string[];
  onPetFriendlyChange: (enabled: boolean) => void;
  onPetSizesChange: (sizes: string[]) => void;
}) {
  const petSizeOptions = [
    { value: "소형", label: "소형견" },
    { value: "중형", label: "중형견" },
    { value: "대형", label: "대형견" },
  ];

  const togglePetSize = (size: string) => {
    const currentSizes = petSizes || [];
    if (currentSizes.includes(size)) {
      onPetSizesChange(currentSizes.filter((s) => s !== size));
    } else {
      onPetSizesChange([...currentSizes, size]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <span>🐾</span>
          반려동물 동반
        </label>
        <Button
          variant={petFriendly ? "default" : "outline"}
          size="sm"
          onClick={() => onPetFriendlyChange(!petFriendly)}
          className="h-7 text-xs"
        >
          {petFriendly ? "활성화" : "비활성화"}
        </Button>
      </div>
      {petFriendly && (
        <div className="space-y-2 pl-6 border-l-2 border-muted">
          <p className="text-xs text-muted-foreground">크기별 필터</p>
          <div className="flex flex-wrap gap-2">
            {petSizeOptions.map((option) => {
              const isSelected = (petSizes || []).includes(option.value);
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePetSize(option.value)}
                  className="h-7 text-xs"
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 정렬 필터 컴포넌트
 */
function SortFilter({
  sort,
  onSortChange,
}: {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">정렬</label>
      <div className="flex gap-2">
        <Button
          variant={sort === "latest" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange("latest")}
          className="h-8 text-xs"
        >
          최신순
        </Button>
        <Button
          variant={sort === "name" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange("name")}
          className="h-8 text-xs"
        >
          이름순
        </Button>
      </div>
    </div>
  );
}

/**
 * 관광지 필터 컴포넌트
 */
export function TourFilters({
  filters,
  onFiltersChange,
  className,
}: TourFiltersProps) {
  const [areaCodes, setAreaCodes] = useState(DEFAULT_AREA_CODES);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);

  // 지역 코드 로드 (선택 사항, API로 대체)
  useEffect(() => {
    const loadAreaCodes = async () => {
      setIsLoadingAreas(true);
      try {
        const response = await getAreaCode({ numOfRows: 20 });
        const items = extractItems(response);
        if (items.length > 0) {
          setAreaCodes(
            items.map((item) => ({
              code: item.code,
              name: item.name,
            }))
          );
        }
      } catch (error) {
        console.error("지역 코드 로드 실패:", error);
        // 기본값 사용
      } finally {
        setIsLoadingAreas(false);
      }
    };

    // loadAreaCodes(); // 필요시 활성화
  }, []);

  const handleAreaChange = (areaCode: string | null) => {
    onFiltersChange({ ...filters, areaCode });
  };

  const handleTypesChange = (contentTypeIds: ContentTypeId[]) => {
    onFiltersChange({ ...filters, contentTypeIds });
  };

  const handleSortChange = (sort: SortOption) => {
    onFiltersChange({ ...filters, sort });
  };

  const handlePetFriendlyChange = (enabled: boolean) => {
    onFiltersChange({
      ...filters,
      petFriendly: enabled,
      petSizes: enabled ? filters.petSizes : undefined,
    });
  };

  const handlePetSizesChange = (sizes: string[]) => {
    onFiltersChange({ ...filters, petSizes: sizes });
  };

  const hasActiveFilters =
    filters.areaCode !== null ||
    filters.contentTypeIds.length > 0 ||
    filters.petFriendly === true;

  const resetFilters = () => {
    onFiltersChange({
      areaCode: null,
      contentTypeIds: [],
      sort: "latest",
      petFriendly: undefined,
      petSizes: undefined,
    });
  };

  return (
    <div className={cn("space-y-4 rounded-lg border bg-card p-4", className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h3 className="font-semibold">필터</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            초기화
          </Button>
        )}
      </div>

      {/* 필터 옵션 */}
      <div className="space-y-4">
        <AreaFilter
          selectedArea={filters.areaCode}
          onAreaChange={handleAreaChange}
          areaCodes={areaCodes}
        />

        <ContentTypeFilter
          selectedTypes={filters.contentTypeIds}
          onTypesChange={handleTypesChange}
        />

        <PetFilter
          petFriendly={filters.petFriendly}
          petSizes={filters.petSizes}
          onPetFriendlyChange={handlePetFriendlyChange}
          onPetSizesChange={handlePetSizesChange}
        />

        <SortFilter sort={filters.sort} onSortChange={handleSortChange} />
      </div>
    </div>
  );
}

