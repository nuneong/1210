/**
 * @file use-intersection-observer.ts
 * @description Intersection Observer 커스텀 훅
 *
 * 무한 스크롤을 위한 요소 가시성 감지 훅입니다.
 *
 * 주요 기능:
 * 1. 타겟 요소가 뷰포트에 진입할 때 콜백 실행
 * 2. threshold, rootMargin 등 옵션 지원
 * 3. 메모리 누수 방지를 위한 cleanup
 *
 * @example
 * ```tsx
 * const targetRef = useIntersectionObserver({
 *   onIntersect: () => loadMore(),
 *   enabled: hasMore && !isLoading,
 * });
 *
 * return <div ref={targetRef} />;
 * ```
 */

"use client";

import { useRef, useEffect, useCallback } from "react";

interface UseIntersectionObserverOptions {
  /**
   * 요소가 뷰포트에 진입할 때 호출되는 콜백
   */
  onIntersect: () => void;
  /**
   * Observer 활성화 여부 (false면 감지하지 않음)
   */
  enabled?: boolean;
  /**
   * 루트 요소 (기본: viewport)
   */
  root?: Element | null;
  /**
   * 루트 마진 (기본: "0px")
   */
  rootMargin?: string;
  /**
   * 가시성 임계값 (0~1, 기본: 0.1)
   */
  threshold?: number | number[];
}

/**
 * Intersection Observer 커스텀 훅
 *
 * @param options Observer 옵션
 * @returns 타겟 요소에 연결할 ref
 */
export function useIntersectionObserver({
  onIntersect,
  enabled = true,
  root = null,
  rootMargin = "0px",
  threshold = 0.1,
}: UseIntersectionObserverOptions) {
  const targetRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 콜백을 useCallback으로 메모이제이션
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && enabled) {
        console.log("[IntersectionObserver] 요소 감지됨, 콜백 실행");
        onIntersect();
      }
    },
    [onIntersect, enabled]
  );

  useEffect(() => {
    const target = targetRef.current;

    // 타겟이 없거나 비활성화 상태면 Observer 해제
    if (!target || !enabled) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    // 기존 Observer 해제
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 새 Observer 생성
    observerRef.current = new IntersectionObserver(handleIntersect, {
      root,
      rootMargin,
      threshold,
    });

    // 타겟 관찰 시작
    observerRef.current.observe(target);
    console.log("[IntersectionObserver] 관찰 시작");

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
        console.log("[IntersectionObserver] 관찰 종료");
      }
    };
  }, [handleIntersect, enabled, root, rootMargin, threshold]);

  return targetRef;
}

