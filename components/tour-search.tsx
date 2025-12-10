/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 키워드로 관광지를 검색하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 검색창 UI
 * 2. 엔터 또는 버튼 클릭으로 검색
 * 3. 검색 중 로딩 스피너
 * 4. 검색 결과 개수 표시
 *
 * @dependencies
 * - components/ui/input.tsx: 입력 컴포넌트
 * - components/ui/button.tsx: 버튼 컴포넌트
 * - lib/api/tour-api.ts: 검색 API
 */

"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourSearchProps {
  /**
   * 검색 키워드
   */
  keyword: string;
  /**
   * 검색 핸들러
   */
  onSearch: (keyword: string) => void;
  /**
   * 검색 중 여부
   */
  isLoading?: boolean;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 관광지 검색 컴포넌트
 */
export function TourSearch({
  keyword,
  onSearch,
  isLoading = false,
  className,
}: TourSearchProps) {
  const [inputValue, setInputValue] = useState(keyword);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue("");
    onSearch("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-2", className)}
      role="search"
      aria-label="관광지 검색"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="관광지명, 주소, 설명으로 검색..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-10 pr-10"
          disabled={isLoading}
          aria-label="검색어 입력"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="검색어 지우기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              검색 중...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              검색
            </>
          )}
        </Button>
        {keyword && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isLoading}
          >
            초기화
          </Button>
        )}
      </div>
    </form>
  );
}

