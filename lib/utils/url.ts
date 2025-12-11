/**
 * @file url.ts
 * @description URL 유틸리티 함수
 *
 * URL 관련 유틸리티 함수를 제공합니다.
 *
 * 주요 기능:
 * 1. 절대 URL 생성
 * 2. 상대 경로를 절대 URL로 변환
 */

/**
 * 절대 URL 생성
 *
 * @param path - 상대 경로 또는 절대 경로
 * @returns 절대 URL
 *
 * @example
 * ```ts
 * getAbsoluteUrl("/places/126508")
 * // "https://yourdomain.com/places/126508"
 * ```
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://yourdomain.com");
  
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

